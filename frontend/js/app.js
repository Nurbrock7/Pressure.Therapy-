const SERVICES = [
  { name: 'Deep tissue massage', duration: 60, price: 650, deposit: 150 },
  { name: 'Sports rehab', duration: 45, price: 500, deposit: 100 },
  { name: 'Initial assessment', duration: 30, price: 0, deposit: 0 },
];

const SERVICE_ICONS = {
  'Deep tissue massage': '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v14M2 9h14" stroke="#d85a30" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'Sports rehab': '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6" stroke="#d85a30" stroke-width="1.5"/><path d="M9 6v3l2 2" stroke="#d85a30" stroke-width="1.5" stroke-linecap="round"/></svg>',
  'Initial assessment': '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M9 3l6 6-6 6" stroke="#d85a30" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

let quickState = { service: null, time: null };
let bookState = { service: null, time: null };

// Toast
function showToast(msg, isError) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => toast.className = 'toast', 3000);
}

// Format date for display
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Fetch available slots for a date
async function fetchSlots(date) {
  try {
    const res = await fetch(`${API_URL}/api/bookings/slots?date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    return null;
  }
}

// Render time slot grid
function renderSlots(slots, container, state, stateKey) {
  if (!slots) {
    container.innerHTML = '<div style="color:#ef4444;font-size:12px;grid-column:1/-1;">Could not load time slots. Is the server running?</div>';
    return;
  }
  container.innerHTML = '';
  slots.forEach(slot => {
    const div = document.createElement('div');
    div.textContent = slot.time;

    if (container.classList.contains('hc-time-grid')) {
      div.className = 'hc-time';
      if (slot.blocked || !slot.available) div.className += ' blocked';
      if (state[stateKey] === slot.time) div.className += ' selected';
    } else {
      div.className = 'b-time';
      if (slot.blocked || !slot.available) div.className += ' blk';
      if (state[stateKey] === slot.time) div.className += ' sel';
    }

    if (slot.available && !slot.blocked) {
      div.onclick = () => {
        state[stateKey] = slot.time;
        renderSlots(slots, container, state, stateKey);
        if (stateKey === 'time') updateSummary();
        updateQuickBookBtn();
      };
    }
    container.appendChild(div);
  });
}

// ─── Quick Book Card ───

function initQuickBook() {
  const row = document.getElementById('quick-services');
  SERVICES.forEach(svc => {
    const pill = document.createElement('div');
    pill.className = 'hc-pill' + (quickState.service === svc.name ? ' active' : '');
    pill.textContent = svc.name.replace(' massage', '').replace('Initial ', '');
    pill.onclick = () => {
      quickState.service = svc.name;
      quickState.time = null;
      initQuickBook();
      loadQuickSlots();
    };
    row.appendChild(pill);
  });
  if (!quickState.service) {
    quickState.service = SERVICES[0].name;
    row.querySelector('.hc-pill').classList.add('active');
  }
}

async function loadQuickSlots() {
  const today = new Date().toISOString().split('T')[0];
  const label = document.getElementById('quick-date-label');
  label.textContent = `Pick a time · ${formatDate(today)}`;

  const container = document.getElementById('quick-slots');
  container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

  const slots = await fetchSlots(today);
  renderSlots(slots, container, quickState, 'time');
  updateQuickBookBtn();
}

function updateQuickBookBtn() {
  const btn = document.getElementById('quick-book-btn');
  btn.disabled = !quickState.service || !quickState.time;
}

function quickBookContinue() {
  if (!quickState.service || !quickState.time) return;

  const serviceSelect = document.getElementById('book-service');
  serviceSelect.value = quickState.service;
  bookState.service = quickState.service;

  const dateInput = document.getElementById('book-date');
  dateInput.value = new Date().toISOString().split('T')[0];
  dateInput.dispatchEvent(new Event('change'));

  bookState.time = quickState.time;
  updateSummary();

  document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => document.getElementById('book-name').focus(), 500);
}

// ─── Services Grid ───

function renderServices() {
  const grid = document.getElementById('services-grid');
  SERVICES.forEach(svc => {
    const card = document.createElement('div');
    card.className = 'svc-card';
    card.onclick = () => {
      document.getElementById('book-service').value = svc.name;
      bookState.service = svc.name;
      updateSummary();
      document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
    };
    card.innerHTML = `
      <div class="svc-icon">${SERVICE_ICONS[svc.name]}</div>
      <div class="svc-name">${svc.name}</div>
      <div class="svc-dur">${svc.duration} min session</div>
      <div class="svc-footer">
        <div>
          <div class="svc-price">${svc.price === 0 ? 'Free' : 'R' + svc.price}</div>
          <div class="svc-deposit">${svc.deposit > 0 ? 'R' + svc.deposit + ' deposit' : 'via WhatsApp'}</div>
        </div>
        <button class="btn-primary" style="font-size:12px;padding:6px 14px;">${svc.deposit > 0 ? 'Book' : 'DM us'}</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─── Booking Form ───

function initBookingForm() {
  const serviceSelect = document.getElementById('book-service');
  SERVICES.forEach(svc => {
    const opt = document.createElement('option');
    opt.value = svc.name;
    opt.textContent = `${svc.name} — ${svc.price === 0 ? 'Free' : 'R' + svc.price} (${svc.duration} min)`;
    serviceSelect.appendChild(opt);
  });

  serviceSelect.onchange = () => {
    bookState.service = serviceSelect.value;
    updateSummary();
  };

  const dateInput = document.getElementById('book-date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.onchange = async () => {
    const container = document.getElementById('book-slots');
    container.innerHTML = '<div class="loading" style="grid-column:1/-1;"><div class="spinner"></div>Loading...</div>';
    bookState.time = null;
    const slots = await fetchSlots(dateInput.value);
    renderSlots(slots, container, bookState, 'time');
    updateSummary();
  };
}

function updateSummary() {
  const svc = SERVICES.find(s => s.name === bookState.service);
  document.getElementById('sum-service').textContent = svc ? svc.name : '—';
  document.getElementById('sum-duration').textContent = svc ? svc.duration + ' min' : '—';
  document.getElementById('sum-date').textContent = document.getElementById('book-date').value
    ? formatDate(document.getElementById('book-date').value) : '—';
  document.getElementById('sum-time').textContent = bookState.time || '—';
  document.getElementById('sum-total').textContent = svc ? (svc.price === 0 ? 'Free' : 'R' + svc.price) : '—';

  const depositEl = document.getElementById('sum-deposit');
  const payBtn = document.getElementById('pay-btn');

  if (svc && svc.deposit > 0) {
    depositEl.textContent = `Deposit due now: R${svc.deposit} via PayFast`;
    payBtn.textContent = `Pay R${svc.deposit} deposit via PayFast`;
  } else if (svc && svc.price === 0) {
    depositEl.textContent = 'Free — booked via WhatsApp';
    payBtn.textContent = 'Book via WhatsApp';
  } else {
    depositEl.textContent = '';
    payBtn.textContent = 'Pay deposit via PayFast';
  }

  const name = document.getElementById('book-name').value.trim();
  const phone = document.getElementById('book-phone').value.trim();
  const email = document.getElementById('book-email').value.trim();
  const date = document.getElementById('book-date').value;

  payBtn.disabled = !(svc && name && phone && email && date && bookState.time);
}

async function submitBooking() {
  const svc = SERVICES.find(s => s.name === bookState.service);
  if (!svc) return;

  if (svc.name === 'Initial assessment') {
    window.open('https://wa.me/27000000000?text=Hi%2C%20I%27d%20like%20to%20book%20a%20free%20assessment', '_blank');
    return;
  }

  const payBtn = document.getElementById('pay-btn');
  payBtn.disabled = true;
  payBtn.textContent = 'Processing...';

  const body = {
    name: document.getElementById('book-name').value.trim(),
    phone: document.getElementById('book-phone').value.trim(),
    email: document.getElementById('book-email').value.trim(),
    service: bookState.service,
    date: document.getElementById('book-date').value,
    time: bookState.time,
  };

  try {
    const res = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Something went wrong', true);
      payBtn.disabled = false;
      payBtn.textContent = `Pay R${svc.deposit} deposit via PayFast`;
      return;
    }

    if (data.type === 'whatsapp') {
      window.open(data.whatsapp_url, '_blank');
      return;
    }

    // Redirect to PayFast
    const form = document.getElementById('payfast-form');
    form.action = data.payfast.payfast_url;
    form.innerHTML = '';
    Object.entries(data.payfast.fields).forEach(([key, val]) => {
      if (key === 'passphrase') return;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = val;
      form.appendChild(input);
    });
    form.submit();
  } catch {
    showToast('Network error — is the server running?', true);
    payBtn.disabled = false;
    payBtn.textContent = `Pay R${svc.deposit} deposit via PayFast`;
  }
}

// Listen for input changes to update pay button state
['book-name', 'book-phone', 'book-email'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateSummary);
});

// ─── Init ───

renderServices();
initBookingForm();
initQuickBook();
loadQuickSlots();

// Check for cancelled payment
if (new URLSearchParams(window.location.search).get('cancelled')) {
  showToast('Payment was cancelled. You can try again.', true);
  history.replaceState(null, '', 'index.html');
}
