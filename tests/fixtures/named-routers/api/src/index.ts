import { Hono } from 'hono';
import { requireAuth } from './auth';
import { teams } from './routes/teams';
import matchRoutes from './routes/matches';

const app = new Hono();
app.use('/api/*', requireAuth);
app.get('/health', (c) => c.text('ok'));
app.route('/api/teams', teams);
app.route('/api/matches', matchRoutes);

export default app;
