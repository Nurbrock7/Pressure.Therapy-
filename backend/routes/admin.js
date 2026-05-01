const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

function authMiddleware(req, res, next) {
  const password = req.headers['x-admin-password'];
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(authMiddleware);

router.get('/bookings', async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.get('/blocked-slots', async (req, res) => {
  const { date } = req.query;
  let query = supabase.from('blocked_slots').select('*');

  if (date) {
    query = query.eq('date', date);
  } else {
    query = query.gte('date', new Date().toISOString().split('T')[0]);
  }

  const { data, error } = await query.order('date').order('time');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post('/blocked-slots', async (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ error: 'Date and time are required' });

  const { data: existing } = await supabase
    .from('blocked_slots')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .limit(1);

  if (existing && existing.length > 0) {
    return res.status(409).json({ error: 'Slot already blocked' });
  }

  const { data, error } = await supabase
    .from('blocked_slots')
    .insert({ date, time })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.delete('/blocked-slots', async (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ error: 'Date and time are required' });

  const { error } = await supabase
    .from('blocked_slots')
    .delete()
    .eq('date', date)
    .eq('time', time);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.delete('/bookings/:id', async (req, res) => {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
