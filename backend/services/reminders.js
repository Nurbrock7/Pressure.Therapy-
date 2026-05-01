const cron = require('node-cron');
const supabase = require('./supabase');
const { sendBookingReminder } = require('./notifications');

function startReminderJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('[Reminders] Checking for upcoming bookings...');

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const targetDate = in24h.toISOString().split('T')[0];

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', targetDate)
      .eq('status', 'confirmed')
      .eq('reminder_sent', false);

    if (error) {
      console.error('[Reminders] Query error:', error);
      return;
    }

    if (!bookings || bookings.length === 0) {
      console.log('[Reminders] No reminders to send.');
      return;
    }

    for (const booking of bookings) {
      const [hours] = booking.time.split(':').map(Number);
      const bookingDateTime = new Date(`${booking.date}T${booking.time}:00`);
      const diffMs = bookingDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours > 23 && diffHours < 25) {
        console.log(`[Reminders] Sending reminder to ${booking.name} for ${booking.date} ${booking.time}`);
        await sendBookingReminder(booking);
        await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', booking.id);
      }
    }
  });

  console.log('[Reminders] Cron job started — runs every hour');
}

module.exports = { startReminderJob };
