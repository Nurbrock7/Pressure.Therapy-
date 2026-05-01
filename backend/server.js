require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bookingsRouter = require('./routes/bookings');
const paymentsRouter = require('./routes/payments');
const adminRouter = require('./routes/admin');
const { startReminderJob } = require('./services/reminders');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Pressure Therapy API running on port ${PORT}`);
  startReminderJob();
});
