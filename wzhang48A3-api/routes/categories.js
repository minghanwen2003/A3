import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const rows = await query('SELECT id, slug, name FROM categories ORDER BY name');
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

export default router;
