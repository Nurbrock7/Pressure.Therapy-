const crypto = require('crypto');

const SANDBOX_URL = 'https://sandbox.payfast.co.za/eng/process';
const LIVE_URL = 'https://www.payfast.co.za/eng/process';

function generatePayfastForm(booking, depositAmount) {
  const isSandbox = process.env.PAYFAST_SANDBOX === 'true';
  const data = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url: `${process.env.FRONTEND_URL}/confirmation.html?booking_id=${booking.id}`,
    cancel_url: `${process.env.FRONTEND_URL}/index.html?cancelled=true`,
    notify_url: `${process.env.BACKEND_URL}/api/payments/notify`,
    name_first: booking.name.split(' ')[0],
    name_last: booking.name.split(' ').slice(1).join(' ') || '',
    email_address: booking.email,
    m_payment_id: booking.id,
    amount: depositAmount.toFixed(2),
    item_name: `Pressure Therapy - ${booking.service} deposit`,
    item_description: `${booking.service} on ${booking.date} at ${booking.time}`,
  };

  if (process.env.PAYFAST_PASSPHRASE) {
    data.passphrase = process.env.PAYFAST_PASSPHRASE;
  }

  const paramString = Object.keys(data)
    .filter(key => data[key] !== '')
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');

  const signature = crypto.createHash('md5').update(paramString).digest('hex');

  return {
    payfast_url: isSandbox ? SANDBOX_URL : LIVE_URL,
    fields: { ...data, signature },
  };
}

function validateITN(body, headers) {
  const pfParamString = Object.keys(body)
    .filter(key => key !== 'signature')
    .map(key => `${key}=${encodeURIComponent(body[key]).replace(/%20/g, '+')}`)
    .join('&');

  let stringToHash = pfParamString;
  if (process.env.PAYFAST_PASSPHRASE) {
    stringToHash += `&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE).replace(/%20/g, '+')}`;
  }

  const calculatedSignature = crypto.createHash('md5').update(stringToHash).digest('hex');
  return calculatedSignature === body.signature;
}

module.exports = { generatePayfastForm, validateITN };
