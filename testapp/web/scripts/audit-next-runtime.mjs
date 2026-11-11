// Read-only reachability inventory. A candidate is not permission to delete it.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const root = process.cwd();
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const source = new Map(
  program
    .getSourceFiles()
    .filter((s) => path.resolve(s.fileName).startsWith(path.join(root, 'src') + path.sep))
    .map((s) => [path.resolve(s.fileName), s]),
);
const graph = new Map();
for (const [file, ast] of source) {
  const dependencies = new Set();
  function visit(node) {
    let literal;
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      literal = node.moduleSpecifier.text;
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      literal = node.arguments[0].text;
    if (literal) {
      const resolved = ts.resolveModuleName(literal, file, parsed.options, ts.sys).resolvedModule
        ?.resolvedFileName;
      if (resolved) dependencies.add(path.resolve(resolved));
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  graph.set(file, [...dependencies]);
}
const entries = [...source.keys()].filter(
  (file) =>
    /\/app\/(?:.*\/)?(?:page|layout|route|loading|error|not-found|global-error|template|default|manifest|robots|sitemap|icon|apple-icon|opengraph-image|twitter-image)\.[cm]?[jt]sx?$/.test(
      file,
    ) ||
    /\/src\/(?:proxy|middleware|instrumentation|instrumentation-client)\.[cm]?[jt]s$/.test(file),
);
const reached = new Set();
function walk(file) {
  if (reached.has(file)) return;
  reached.add(file);
  for (const dep of graph.get(file) ?? []) walk(dep);
}
entries.forEach(walk);
const relative = (p) => path.relative(root, p).replaceAll(path.sep, '/');
const result = {
  nextEntries: entries.map(relative).sort(),
  sourceModules: source.size,
  reachableSource: [...source.keys()].filter((f) => reached.has(f)).length,
  unreachableCandidates: [...source.keys()]
    .filter((f) => !reached.has(f) && !f.endsWith('.d.ts'))
    .map(relative)
    .sort(),
  externalProjectInputs: [...reached]
    .filter((f) => !source.has(f) && !f.includes('/node_modules/'))
    .map(relative)
    .sort(),
};
if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
else console.log(JSON.stringify(result));
