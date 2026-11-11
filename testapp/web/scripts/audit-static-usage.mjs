// Read-only inventory. Never imports or executes a candidate, starts a server,
// generates contracts, or decides removal merely from a missing import.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
import { gzipSync } from 'node:zlib';
const root = path.resolve('..');
const entries = [];
const textInputs = [];
const protectedDirectory = /^(?:node_modules|\.next|\.makan[^/]*|\.venv[^/]*|\.git)$/;
const textExtension = /\.(?:[cm]?[jt]sx?|json|css|ya?ml|html|md|txt|svg|sh|py|ps1)$/i;
function category(relative) {
  if (/(?:^|\/)\.env(?:\.|$)|(?:^|\/)\.makan/.test(relative)) return 'protected-private';
  if (/^web\/(?:contracts|src\/generated)\//.test(relative)) return 'contract-codegen';
  if (/^web\/(?:src|config)\//.test(relative)) return 'runtime';
  if (/^web\/tests\//.test(relative)) return 'test-fixture';
  if (/^web\/(?:contracts|src\/generated)\//.test(relative)) return 'contract-codegen';
  if (/^web\/design\//.test(relative)) return 'design-reference';
  if (/^web\/public\//.test(relative)) return 'asset';
  if (/^web\/scripts\//.test(relative)) return 'tool';
  if (/^web\/output\/review\//.test(relative)) return 'visual-evidence-preserve';
  if (/^web\/output\/delivery\//.test(relative)) return 'delivery-artifact-review-before-removal';
  if (/^web\/tmp\//.test(relative)) return 'working-evidence-review-before-removal';
  if (/^web\/(?:docs|output\/(?:pdf|docx|reports))\//.test(relative))
    return 'documentation-evidence';
  if (/^\.github\//.test(relative)) return 'configuration-launcher';
  if (/\/\.next$/.test(relative)) return 'active-build-preserve';
  if (/\/node_modules$/.test(relative)) return 'installed-dependency';
  if (/\/\.venv/.test(relative)) return 'tool-environment-preserve';
  if (
    /(?:^|\/)(?:package(?:-lock)?\.json|.*config\.[cm]?[jt]s|Dockerfile|.*compose.*\.ya?ml|setup\.sh|tsconfig\.json|next-env\.d\.ts|.*playwright.*\.ts|AGENTS\.md|README\.md|readme\.md|\.[^/]+)$/.test(
      relative,
    )
  )
    return 'configuration-launcher';
  return 'unclassified-preserve';
}
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    const relative = path.relative(root, file).replaceAll(path.sep, '/');
    const stat = fs.lstatSync(file);
    if (item.isSymbolicLink()) {
      entries.push({ path: relative, category: 'symlink-preserve', bytes: stat.size });
    } else if (item.isDirectory()) {
      if (protectedDirectory.test(item.name)) {
        // Do not traverse session filenames, secrets, dependency trees or the active build.
        entries.push({ path: relative + '/', category: category(relative), directory: true });
      } else walk(file);
    } else {
      const kind = category(relative);
      entries.push({ path: relative, category: kind, bytes: stat.size });
      if (
        kind !== 'protected-private' &&
        (textExtension.test(item.name) ||
          ['Dockerfile', '.dockerignore', '.gitignore', '.gitattributes', '.nvmrc'].includes(
            item.name,
          )) &&
        stat.size < 5e6 &&
        !/^web\/(?:tmp|output|design\/reference-v5)\//.test(relative)
      )
        textInputs.push({ file, relative, text: fs.readFileSync(file, 'utf8') });
    }
  }
}
walk(root);
const options = ts.parseJsonConfigFileContent(
  ts.readConfigFile('tsconfig.json', ts.sys.readFile).config,
  ts.sys,
  process.cwd(),
).options;
const imports = [];
const dynamic = [];
for (const input of textInputs.filter((i) => /\.[cm]?[jt]sx?$/.test(i.file))) {
  const ast = ts.createSourceFile(
    input.file,
    input.text,
    ts.ScriptTarget.Latest,
    true,
    input.file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  function record(specifier, node, kind) {
    const target = ts.resolveModuleName(specifier, input.file, options, ts.sys).resolvedModule
      ?.resolvedFileName;
    const css = specifier.endsWith('.css')
      ? path.resolve(path.dirname(input.file), specifier.replace(/^@\//, path.resolve('src') + '/'))
      : null;
    imports.push({
      from: input.relative,
      kind,
      specifier,
      target: target
        ? path.relative(root, target).replaceAll(path.sep, '/')
        : css
          ? path.relative(root, css).replaceAll(path.sep, '/')
          : null,
      line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
    });
  }
  function visit(n) {
    if (
      (ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) &&
      n.moduleSpecifier &&
      ts.isStringLiteral(n.moduleSpecifier)
    )
      record(n.moduleSpecifier.text, n, 'static');
    if (
      ts.isCallExpression(n) &&
      (n.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(n.expression) && n.expression.text === 'require'))
    ) {
      if (n.arguments[0] && ts.isStringLiteralLike(n.arguments[0]))
        record(n.arguments[0].text, n, 'dynamic-literal');
      else
        dynamic.push({
          from: input.relative,
          line: ast.getLineAndCharacterOfPosition(n.getStart(ast)).line + 1,
          kind: 'nonliteral-import-review',
        });
    }
    ts.forEachChild(n, visit);
  }
  visit(ast);
}
const candidates = [
  'src/design/v5-author.css',
  'src/design/v5-product.css',
  'scripts/build-v5-product-styles.mjs',
  'postcss.config.mjs',
];
const cleanup = candidates.map((relative) => {
  const file = path.resolve(relative);
  const exists = fs.existsSync(file);
  const names = [relative, path.basename(relative)];
  const mentions = textInputs
    .filter((i) => i.file !== file && names.some((name) => i.text.includes(name)))
    .map((i) => ({ path: i.relative, kind: category(i.relative) }));
  return {
    path: 'web/' + relative,
    bytes: exists ? fs.statSync(file).size : null,
    sha256: exists ? crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') : null,
    importedBy: imports.filter((i) => i.target === 'web/' + relative),
    mentions,
  };
});
const groups = {};
for (const entry of entries) {
  const group = (groups[entry.category] ??= { files: 0, bytes: 0 });
  group.files++;
  group.bytes += entry.bytes ?? 0;
}
const report = {
  createdAt: new Date().toISOString(),
  scope: root,
  mode: 'static-read-only',
  coverage: [
    'Next conventions including proxy/instrumentation and App Router entries',
    'static imports, exports, literal dynamic imports, aliases and barrels',
    'CSS url()/font and public URL strings retained as text inputs',
    'service worker, manifests, configuration, npm scripts, Docker/Compose, tests and fixtures',
    'documentation links are consumers, not necessarily runtime imports',
  ],
  limitations: [
    'Nonliteral imports and runtime data URLs are retained for manual review.',
    'No file is deleted by this audit. Unclassified is not unused.',
    'Private session directories, secret contents, installed dependency trees and active build output are not traversed.',
  ],
  groups,
  candidates: cleanup,
  nonliteralImports: dynamic,
  imports,
  inventory: entries,
};
const out = 'docs/quality/STATIC_USAGE_20261110.json';
const evidence = 'docs/quality/STATIC_USAGE_20261110.inventory.json.gz';
const archive = gzipSync(JSON.stringify({ imports, inventory: entries }));
fs.writeFileSync(evidence, archive);
fs.writeFileSync(
  out,
  JSON.stringify(
    {
      ...report,
      imports: undefined,
      inventory: undefined,
      detailedInventory: {
        path: evidence,
        sha256: crypto.createHash('sha256').update(archive).digest('hex'),
        bytes: archive.length,
      },
      unclassifiedRetained: entries.filter((entry) => entry.category === 'unclassified-preserve'),
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({
    report: out,
    groups,
    imports: imports.length,
    candidates: cleanup.map((c) => ({
      path: c.path,
      importedBy: c.importedBy.length,
      mentions: c.mentions.length,
    })),
  }),
);
