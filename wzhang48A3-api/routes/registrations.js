import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

function asPositiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

router.post('/', async (req, res, next) => {
  const eventId = asPositiveInt(req.body.event_id);
  const fullName = String(req.body.full_name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim();
  const tickets = asPositiveInt(req.body.tickets);
  const registrationDate = req.body.registration_date || null;

  if (!eventId || fullName.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !tickets || tickets > 20) {
    return res.status(400).json({ error: { message: 'Provide a valid event, name, email and ticket quantity (1-20).' } });
  }

  try {
    const event = await query('SELECT id, capacity, status, end_time FROM events WHERE id = ?', [eventId]);
    if (!event.length) return res.status(404).json({ error: { message: 'Event not found.' } });
    if (event[0].status !== 'active') return res.status(409).json({ error: { message: 'This event is not open for registration.' } });
    if (new Date(event[0].end_time) < new Date()) return res.status(409).json({ error: { message: 'This event has already finished.' } });

    const [{ total }] = await query('SELECT COALESCE(SUM(tickets), 0) AS total FROM registrations WHERE event_id = ?', [eventId]);
    if (event[0].capacity && Number(total) + tickets > event[0].capacity) {
      return res.status(409).json({ error: { message: 'There are not enough tickets remaining.' } });
    }

    const result = await query(
      `INSERT INTO registrations (event_id, full_name, email, phone, tickets, registration_date)
       VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))`,
      [eventId, fullName, email, phone || null, tickets, registrationDate]
    );
    res.status(201).json({ data: { id: result.insertId }, message: 'Registration completed.' });
  } catch (error) {
    next(error);
  }
});

export default router;
