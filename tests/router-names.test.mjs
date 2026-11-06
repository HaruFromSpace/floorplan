// Routers can have any name (#98): a variable this file binds to `new Hono()`, `express.Router()`,
// `Router()` or `express()` is a server, so its endpoints count and its mounts are followed.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { REPO, lib, makeProject, run, readGraph, routeKeys, cleanup } from './helpers.mjs';

const { extract } = await lib('extract.mjs');
const routes = (src, file = 'api/x.ts') => extract(src, 'typescript', file).routes.map((r) => `${r.method} ${r.path} ${r.var}`);

let root, graph;
before(() => {
  root = makeProject({}, { arch: {
    project: { name: 'named-routers', summary: 'Test fixture.' },
    nodes: [
      { id: 'web', label: 'Website', kind: 'ui', summary: 'The website.', paths: ['web/**'] },
      { id: 'api', label: 'Server', kind: 'service', summary: 'The Hono server.', paths: ['api/**'] },
      { id: 'shop', label: 'Shop server', kind: 'service', summary: 'The Express server.', paths: ['server/**'] },
    ],
  } });
  fs.cpSync(path.join(REPO, 'tests', 'fixtures', 'named-routers'), root, { recursive: true });
  run('scan.mjs', root);
  run('build.mjs', root, '--no-claude-md');
  graph = readGraph(root);
});
after(() => cleanup(root));

test('a router of any name is a server: new Hono(), express.Router(), Router(), express()', () => {
  assert.deepEqual(routes([
    `export const frentes = new Hono<Env>();`,
    `frentes.get('/', list);`,
    `const userRoutes = express.Router({ mergeParams: true });`,
    `userRoutes.post('/:id/ban', ban);`,
    `let v2 = Router();`,
    `v2.put('/items/:id', save);`,
    `const shop = express();`,
    `shop.delete('/cart', clear);`,
  ].join('\n')), ['GET / frentes', 'POST /:id/ban userRoutes', 'PUT /items/:id v2', 'DELETE /cart shop']);
});

test('other objects with get and post methods are still not servers', () => {
  assert.deepEqual(routes([
    `const cache = new Map();`,
    `cache.get('/x');`,
    `const client = axios.create();`,
    `client.post('/orders', body);`,
  ].join('\n')), []);
  // and that axios call is still read as a request
  assert.deepEqual(extract(`const client = axios.create();\nclient.post('/orders', body);`, 'typescript', 'web/x.ts').calls.map((c) => c.path), ['/orders']);
});

test("a named router's endpoints aren't also read as requests the file makes", () => {
  assert.deepEqual(extract(`const teams = new Hono();\nteams.get('/teams/:id', h);`, 'typescript', 'api/x.ts').calls, []);
});

test('named routers get the prefix they are mounted under, through a named export, a default export or require()', () => {
  assert.deepEqual(routeKeys(graph), [
    'DELETE /shop/orders/:id', 'GET /api/matches/:id', 'GET /api/teams', 'GET /health', 'GET /shop/orders', 'POST /api/teams/:id/join',
  ]);
});

test("the website's requests reach the router that answers them", () => {
  const http = graph.links.filter((l) => l.k === 'http').map((l) => `${l.a.slice(2)} -> ${l.b.slice(2)} ${l.labels.join(', ')}`).sort();
  assert.deepEqual(http, [
    'web/src/api.ts -> api/src/routes/matches.ts GET /api/matches/:id',
    'web/src/api.ts -> api/src/routes/teams.ts GET /api/teams, POST /api/teams/:id/join',
    'web/src/api.ts -> server/routes/orders.js DELETE /shop/orders/:id',
  ]);
});
