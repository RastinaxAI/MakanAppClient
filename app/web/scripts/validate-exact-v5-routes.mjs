// Validate matrix entry points using the product guards and Next's real page files.
// A valid route template is not proof of authorization, a state, or visual parity.
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { createHash } from 'node:crypto';
const read = (file) => fs.readFile(file, 'utf8');
async function guard(file, name, prelude = '') {
  const source = await read(file);
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const fn = ast.statements.find(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === name,
  );
  if (!fn) throw Error('Missing actual product guard: ' + name);
  const { outputText } = ts.transpileModule(prelude + '\n' + fn.getText(ast), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const scope = { exports: {} };
  vm.runInNewContext(outputText, scope, { timeout: 1000 });
  return {
    fn: scope.exports[name],
    source: file,
    sha256: createHash('sha256').update(source).digest('hex'),
  };
}
const school = await guard('src/config/navigation.ts', 'isSchoolPath');
const extracurricular = await guard(
  'src/features/extracurricular/routes.ts',
  'isExtracurricularPath',
  'const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;',
);
const pages = [];
async function walk(dir) {
  for (const file of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, file.name);
    if (file.isDirectory()) await walk(full);
    else if (file.name === 'page.tsx') pages.push(full);
  }
}
await walk('src/app');
const patterns = pages.map((file) => {
  const parts = path
    .relative('src/app', path.dirname(file))
    .split('/')
    .filter((part) => part && !/^\(.+\)$/.test(part));
  const pattern =
    '^' +
    parts
      .map((part) =>
        part.startsWith('[[...')
          ? '(?:/.*)?'
          : part.startsWith('[...')
            ? '/.+'
            : part.startsWith('[')
              ? '/[^/]+'
              : '/' + part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      )
      .join('') +
    '/?$';
  return { file, regex: new RegExp(pattern) };
});
const rows = JSON.parse(await read('docs/design/exact-v1/screen-route-matrix.json'));
const uuid = '00000000-0000-4000-8000-000000000002';
const checks = rows
  .filter((row) => row.actual_component !== 'outside-this-repository')
  .map((row) => {
    const route = row.actual_route.replaceAll(/\{[^}]+\}/g, uuid);
    const url = new URL(route, 'http://127.0.0.1');
    const entry = patterns.find((item) => item.regex.test(url.pathname));
    let valid = !!entry,
      source = entry?.file;
    if (url.pathname.startsWith('/personal/education')) {
      valid &&= school.fn(
        url.pathname.slice('/personal/education'.length).split('/').filter(Boolean),
      );
      source = school.source;
    }
    if (url.pathname.startsWith('/personal/extracurricular/')) {
      valid &&= extracurricular.fn(
        url.pathname.slice('/personal/extracurricular/'.length).split('/'),
      );
      source = extracurricular.source;
    }
    return {
      scenario: row.scenario_id,
      template: row.actual_route,
      valid,
      source,
      entryOnly: true,
    };
  });
const result = {
  method:
    'Actual pure route guards plus installed Next page file inventory; no network, account or state is accessed.',
  guards: [school, extracurricular].map(({ source, sha256 }) => ({ source, sha256 })),
  checked: checks.length,
  valid: checks.filter((row) => row.valid).length,
  invalid: checks.filter((row) => !row.valid),
  checks,
};
await fs.writeFile(
  'docs/design/exact-v1/route-validation.json',
  JSON.stringify(result, null, 2) + '\n',
);
console.log(
  JSON.stringify({ checked: result.checked, valid: result.valid, invalid: result.invalid }),
);
if (result.invalid.length) process.exitCode = 1;
