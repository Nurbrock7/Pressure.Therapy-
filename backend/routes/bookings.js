const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { generatePayfastForm } = require('../services/payfast');

const SERVICES = {
  'Deep tissue massage': { duration: 60, price: 650, deposit: 150 },
  'Sports rehab': { duration: 45, price: 500, deposit: 100 },
  'Initial assessment': { duration: 30, price: 0, deposit: 0 },
};

router.get('/services', (req, res) => {
  const services = Object.entries(SERVICES).map(([name, info]) => ({
    name,
    ...info,
  }));
  res.json(services);
});

router.get('/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  const allSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  const [blockedResult, bookedResult] = await Promise.all([
    supabase.from('blocked_slots').select('time').eq('date', date),
    supabase.from('bookings').select('time').eq('date', date).in('status', ['confirmed', 'pending']),
  ]);

  const blockedTimes = new Set((blockedResult.data || []).map(s => s.time));
  const bookedTimes = new Set((bookedResult.data || []).map(b => b.time));

  const slots = allSlots.map(time => ({
    time,
    available: !blockedTimes.has(time) && !bookedTimes.has(time),
    blocked: blockedTimes.has(time),
  }));

  res.json(slots);
});

router.post('/', async (req, res) => {
  const { name, phone, email, service, date, time } = req.body;

  if (!name || !phone || !email || !service || !date || !time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const svcInfo = SERVICES[service];
  if (!svcInfo) return res.status(400).json({ error: 'Invalid service' });

  if (service === 'Initial assessment') {
    return res.json({
      type: 'whatsapp',
      message: 'Initial assessments are booked via WhatsApp. Please message us directly.',
      whatsapp_url: 'https://wa.me/27000000000?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20assessment',
    });
  }

  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .in('status', ['confirmed', 'pending'])
    .limit(1);

  if (existing && existing.length > 0) {
    return res.status(409).json({ error: 'This time slot is already booked' });
  }

  const { data: blocked } = await supabase
    .from('blocked_slots')
    .select('id')
    .eq('date', date)
    .eq('time', time)
    .limit(1);

  if (blocked && blocked.length > 0) {
    return res.status(409).json({ error: 'This time slot is blocked' });
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      name,
      phone,
      email,
      service,
      date,
      time,
      deposit_amount: svcInfo.deposit,
      deposit_paid: false,
      status: 'pending',
      reminder_sent: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Booking insert error:', error);
    return res.status(500).json({ error: 'Failed to create booking' });
  }

  const payfast = generatePayfastForm(booking, svcInfo.deposit);

  res.json({
    type: 'payment',
    booking,
    payfast,
  });
});

router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Booking not found' });
  res.json(data);
});

module.exports = router;
