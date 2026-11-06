import { Hono } from 'hono';

type Env = { Bindings: { DB: unknown } };

export const teams = new Hono<Env>();
teams.get('/', (c) => c.json([]));
teams.post('/:id/join', (c) => c.json({ ok: true }));
