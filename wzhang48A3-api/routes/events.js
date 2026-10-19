import { Router } from 'express';
import { query } from '../db.js';

const router = Router();
const fields = ['title', 'short_desc', 'full_desc', 'city', 'venue', 'address', 'start_time', 'end_time', 'hero_image_url', 'status', 'goal_amount', 'raised_amount', 'capacity', 'latitude', 'longitude', 'category_id'];

function idFrom(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normaliseEvent(body, partial = false) {
  const data = {};
  for (const field of fields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (!partial) {
    const required = ['title', 'category_id', 'start_time', 'end_time', 'city', 'venue'];
    if (required.some((field) => !String(data[field] ?? '').trim())) return { error: 'Title, category, start time, end time, city and venue are required.' };
  }
  if (data.title !== undefined && (String(data.title).trim().length < 3 || String(data.title).length > 200)) return { error: 'Title must contain 3-200 characters.' };
  if (data.category_id !== undefined && !idFrom(data.category_id)) return { error: 'Category is invalid.' };
  if (data.status !== undefined && !['active', 'suspended'].includes(data.status)) return { error: 'Status must be active or suspended.' };
  if (data.start_time !== undefined && data.end_time !== undefined && new Date(data.end_time) <= new Date(data.start_time)) return { error: 'End time must be after start time.' };
  for (const key of ['goal_amount', 'raised_amount']) if (data[key] !== undefined && (Number.isNaN(Number(data[key])) || Number(data[key]) < 0)) return { error: `${key} must be zero or greater.` };
  if (data.capacity !== undefined && (!Number.isInteger(Number(data.capacity)) || Number(data.capacity) < 1)) return { error: 'Capacity must be a positive whole number.' };
  return { data };
}

const select = `
  SELECT e.*, c.name AS category_name, c.slug AS category_slug, o.name AS organisation_name,
         (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) AS registration_count,
         CASE WHEN e.end_time < CURRENT_TIMESTAMP THEN 'past' ELSE e.status END AS lifecycle_status
  FROM events e
  JOIN categories c ON c.id = e.category_id
  JOIN organizations o ON o.id = e.organization_id`;

async function listEvents(req, res, next) {
  try {
    const includeAll = req.query.includeAll === 'true' || req.query.scope === 'admin';
    const includePast = req.query.includePast === 'true' || includeAll;
    let sql = `${select} WHERE 1=1`;
    const params = [];
    if (!includeAll) sql += ` AND e.status = 'active'`;
    if (!includePast) sql += ' AND e.end_time >= CURRENT_TIMESTAMP';
    if (req.query.date) { sql += ' AND DATE(e.start_time) = ?'; params.push(req.query.date); }
    if (req.query.location) { sql += ' AND (e.city LIKE ? OR e.venue LIKE ?)'; params.push(`%${req.query.location}%`, `%${req.query.location}%`); }
    if (req.query.category) { sql += ' AND (c.id = ? OR c.slug = ?)'; params.push(req.query.category, req.query.category); }
    sql += ' ORDER BY e.start_time ASC';
    res.json({ data: await query(sql, params) });
  } catch (error) { next(error); }
}

router.get('/', listEvents);
router.get('/search', listEvents);

router.get('/:id', async (req, res, next) => {
  const id = idFrom(req.params.id);
  if (!id) return res.status(400).json({ error: { message: 'Event id must be a positive integer.' } });
  try {
    const event = await query(`${select} WHERE e.id = ?`, [id]);
    if (!event.length) return res.status(404).json({ error: { message: 'Event not found.' } });
    const registrations = await query(
      'SELECT id, full_name, email, phone, tickets, registration_date FROM registrations WHERE event_id = ? ORDER BY registration_date DESC, id DESC',
      [id]
    );
    res.json({ data: { event: event[0], registrations } });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  const result = normaliseEvent(req.body);
  if (result.error) return res.status(400).json({ error: { message: result.error } });
  try {
    const data = result.data;
    const keys = Object.keys(data);
    const columns = ['organization_id', ...keys];
    const values = [1, ...keys.map((key) => data[key])];
    const placeholders = columns.map(() => '?').join(', ');
    const insert = await query(`INSERT INTO events (${columns.join(', ')}) VALUES (${placeholders})`, values);
    res.status(201).json({ data: { id: insert.insertId }, message: 'Event created.' });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  const id = idFrom(req.params.id);
  if (!id) return res.status(400).json({ error: { message: 'Event id must be a positive integer.' } });
  const result = normaliseEvent(req.body, true);
  if (result.error) return res.status(400).json({ error: { message: result.error } });
  const keys = Object.keys(result.data);
  if (!keys.length) return res.status(400).json({ error: { message: 'At least one editable field is required.' } });
  try {
    const existing = await query('SELECT id, start_time, end_time FROM events WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: { message: 'Event not found.' } });
    if (result.data.start_time === undefined) result.data.start_time = existing[0].start_time;
    if (result.data.end_time === undefined) result.data.end_time = existing[0].end_time;
    const timeCheck = normaliseEvent(result.data, true);
    if (timeCheck.error) return res.status(400).json({ error: { message: timeCheck.error } });
    const updateKeys = Object.keys(result.data);
    await query(`UPDATE events SET ${updateKeys.map((key) => `${key} = ?`).join(', ')} WHERE id = ?`, [...updateKeys.map((key) => result.data[key]), id]);
    res.json({ data: { id }, message: 'Event updated.' });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  const id = idFrom(req.params.id);
  if (!id) return res.status(400).json({ error: { message: 'Event id must be a positive integer.' } });
  try {
    const existing = await query('SELECT id FROM events WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ error: { message: 'Event not found.' } });
    const [{ count }] = await query('SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?', [id]);
    if (Number(count) > 0) return res.status(409).json({ error: { message: 'This event cannot be deleted because it has registrations.' } });
    await query('DELETE FROM events WHERE id = ?', [id]);
    res.json({ data: { id }, message: 'Event deleted.' });
  } catch (error) { next(error); }
});

export default router;
