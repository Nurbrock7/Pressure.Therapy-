const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const { validateITN } = require('../services/payfast');
const { sendBookingConfirmation } = require('../services/notifications');

router.post('/notify', express.urlencoded({ extended: false }), async (req, res) => {
  console.log('[PayFast ITN] Received:', req.body);

  const isValid = validateITN(req.body, req.headers);
  if (!isValid) {
    console.error('[PayFast ITN] Invalid signature');
    return res.status(400).send('Invalid signature');
  }

  const bookingId = req.body.m_payment_id;
  const paymentStatus = req.body.payment_status;

  if (paymentStatus === 'COMPLETE') {
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        deposit_paid: true,
        status: 'confirmed',
        pf_payment_id: req.body.pf_payment_id,
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('[PayFast ITN] Update error:', error);
      return res.status(500).send('DB error');
    }

    console.log('[PayFast ITN] Booking confirmed:', bookingId);

    sendBookingConfirmation(booking).catch(err => {
      console.error('[Notifications] Error sending confirmation:', err);
    });
  }

  res.status(200).send('OK');
});

module.exports = router;
