import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { usersRoutes } from './routes/users';
import { familiesRoutes } from './routes/families';
import { treeRoutes } from './routes/tree';
import { eventsRoutes } from './routes/events';
import { chatRoutes } from './routes/chat';
import { mediaRoutes } from './routes/media';
import { pollsRoutes } from './routes/polls';
import { contributionsRoutes } from './routes/contributions';
import { notificationsRoutes } from './routes/notifications';
import { feedRoutes } from './routes/feed';
import type { Env, Variables } from './types';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin, c) => c.env.CORS_ORIGIN || origin,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.get('/health', (c) => c.json({ status: 'ok', env: c.env.ENVIRONMENT }));

app.route('/users',              usersRoutes);
app.route('/families',           familiesRoutes);
app.route('/families',           treeRoutes);
app.route('/families',           eventsRoutes);
app.route('/families',           chatRoutes);
app.route('/families',           mediaRoutes);
app.route('/families',           pollsRoutes);
app.route('/families',           contributionsRoutes);
app.route('/families',           feedRoutes);
app.route('/notifications',      notificationsRoutes);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

export default app;
