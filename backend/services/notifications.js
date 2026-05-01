const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWhatsApp(phone, message) {
  const instanceId = process.env.WAAPI_INSTANCE_ID;
  const token = process.env.WAAPI_TOKEN;

  if (!instanceId || !token) {
    console.log('[WaAPI] Not configured, skipping WhatsApp message to', phone);
    return null;
  }

  const formattedPhone = phone.replace(/[^0-9]/g, '');

  try {
    const res = await fetch(`https://waapi.app/api/v1/instances/${instanceId}/client/action/send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: `${formattedPhone}@c.us`,
        message,
      }),
    });
    const data = await res.json();
    console.log('[WaAPI] Message sent:', data);
    return data;
  } catch (err) {
    console.error('[WaAPI] Failed to send:', err.message);
    return null;
  }
}

async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Resend] Not configured, skipping email to', to);
    return null;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Pressure Therapy <bookings@pressuretherapy.co.za>',
      to,
      subject,
      html,
    });
    if (error) {
      console.error('[Resend] Error:', error);
      return null;
    }
    console.log('[Resend] Email sent:', data);
    return data;
  } catch (err) {
    console.error('[Resend] Failed to send:', err.message);
    return null;
  }
}

function buildConfirmationMessage(booking) {
  return `✅ *Booking Confirmed — Pressure Therapy*

Hi ${booking.name},

Your session is booked:
🔹 *Service:* ${booking.service}
🔹 *Date:* ${booking.date}
🔹 *Time:* ${booking.time}
🔹 *Deposit:* R${booking.deposit_amount} paid

📍 Woodstock / Claremont, Cape Town
We'll send you a reminder 24 hours before.

Questions? Reply to this message.`;
}

function buildConfirmationEmail(booking) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; background: #111; color: #f0f0f0; padding: 32px; border-radius: 12px;">
      <h2 style="color: #d85a30; margin-bottom: 4px;">Booking Confirmed</h2>
      <p style="color: #888; font-size: 14px; margin-top: 0;">Pressure Therapy</p>
      <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 20px 0;">
      <table style="width: 100%; font-size: 14px;">
        <tr><td style="color: #888; padding: 6px 0;">Service</td><td style="text-align: right; padding: 6px 0;">${booking.service}</td></tr>
        <tr><td style="color: #888; padding: 6px 0;">Date</td><td style="text-align: right; padding: 6px 0;">${booking.date}</td></tr>
        <tr><td style="color: #888; padding: 6px 0;">Time</td><td style="text-align: right; padding: 6px 0;">${booking.time}</td></tr>
        <tr><td style="color: #888; padding: 6px 0;">Deposit paid</td><td style="text-align: right; padding: 6px 0; color: #d85a30;">R${booking.deposit_amount}</td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 20px 0;">
      <p style="font-size: 13px; color: #666;">📍 Woodstock / Claremont, Cape Town<br>You'll receive a reminder 24 hours before your appointment.</p>
    </div>
  `;
}

function buildReminderMessage(booking) {
  return `⏰ *Reminder — Pressure Therapy*

Hi ${booking.name}, your session is tomorrow:
🔹 *Service:* ${booking.service}
🔹 *Time:* ${booking.time}
📍 Woodstock / Claremont, Cape Town

See you there!`;
}

function buildReminderEmail(booking) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 500px; margin: 0 auto; background: #111; color: #f0f0f0; padding: 32px; border-radius: 12px;">
      <h2 style="color: #d85a30; margin-bottom: 4px;">Appointment Tomorrow</h2>
      <p style="color: #888; font-size: 14px; margin-top: 0;">Pressure Therapy — Reminder</p>
      <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 20px 0;">
      <table style="width: 100%; font-size: 14px;">
        <tr><td style="color: #888; padding: 6px 0;">Service</td><td style="text-align: right; padding: 6px 0;">${booking.service}</td></tr>
        <tr><td style="color: #888; padding: 6px 0;">Date</td><td style="text-align: right; padding: 6px 0;">${booking.date}</td></tr>
        <tr><td style="color: #888; padding: 6px 0;">Time</td><td style="text-align: right; padding: 6px 0;">${booking.time}</td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 20px 0;">
      <p style="font-size: 13px; color: #666;">📍 Woodstock / Claremont, Cape Town</p>
    </div>
  `;
}

async function sendBookingConfirmation(booking) {
  await Promise.all([
    sendWhatsApp(booking.phone, buildConfirmationMessage(booking)),
    sendEmail(booking.email, 'Booking Confirmed — Pressure Therapy', buildConfirmationEmail(booking)),
  ]);
}

async function sendBookingReminder(booking) {
  await Promise.all([
    sendWhatsApp(booking.phone, buildReminderMessage(booking)),
    sendEmail(booking.email, 'Reminder: Your appointment is tomorrow — Pressure Therapy', buildReminderEmail(booking)),
  ]);
}

module.exports = { sendBookingConfirmation, sendBookingReminder };
