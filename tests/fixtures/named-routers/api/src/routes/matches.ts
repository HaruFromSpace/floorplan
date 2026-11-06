import { Hono } from 'hono';

const matchRoutes = new Hono();
matchRoutes.get('/:id', (c) => c.json({}));

export default matchRoutes;
