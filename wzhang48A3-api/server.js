import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventsRouter from './routes/events.js';
import categoriesRouter from './routes/categories.js';
import registrationsRouter from './routes/registrations.js';
import { query } from './db.js';

dotenv.config();

const app = express();
const origins = [process.env.CLIENT_ORIGIN, process.env.ADMIN_ORIGIN].filter(Boolean);

app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', async (_req, res, next) => {
  try {
    await query('SELECT 1 AS ok');
    res.json({ data: { status: 'ok' } });
  } catch (error) {
    next(error);
  }
});

app.get('/api/organization', async (_req, res, next) => {
  try {
    const rows = await query('SELECT * FROM organizations ORDER BY id LIMIT 1');
    res.json({ data: rows[0] || null });
  } catch (error) {
    next(error);
  }
});

app.use('/api/events', eventsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/registrations', registrationsRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: { message: 'This email is already registered for this event.' } });
  }
  res.status(error.status || 500).json({ error: { message: error.expose ? error.message : 'Internal server error.' } });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
