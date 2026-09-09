import { Hono } from 'hono';

const userRoutes = new Hono()
  .get('/', (c) => c.json({ users: ['Cortney', 'Arnold', 'Andrews'] }))
  .get('/:id', (c) => {
    const id = c.req.param('id');
    return c.json({ id, name: 'Alice' });
  })
  .post('/', async (c) => {
    const body = await c.req.json();
    return c.json({ status: 'created', body }, 201);
  });

const authRoutes = new Hono()
  .post('/login', (c) => c.json({ token: 'xyz-token' }))
  .post('/logout', (c) => c.json({ success: true }));

export const api = new Hono()
  .basePath('/api')
  .route('/auth', authRoutes)
  .route('/user', userRoutes);

export type ApiType = typeof api;
