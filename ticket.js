const events = ['Gaming Expo', 'Esports Final', 'Retro Game Night'];
const types = [
  { id: 'standard', name: 'Standard', price: 30, left: 5 },
  { id: 'vip', name: 'VIP', price: 80, left: 2 },
  { id: 'student', name: 'Student', price: 15, left: 8 }
];
const soldOut = ['2026-11-15', '2026-12-01'];
const promos = { GAME10: 10, SAGAT25: 25 };

const $ = id => document.getElementById(id);
const form = $('form');
form.noValidate = true;
const touched = new Set();
const typeOf = () => types.find(t => t.id === form.elements.type.value);
const discount = () => promos[form.elements.promo.value.trim().toUpperCase()] || 0;

const rules = {
  date: v => v < new Date().toLocaleDateString('en-CA') ? 'This date is in the past.'
    : soldOut.includes(v) ? 'This date is sold out.' : '',
  qty: v => {
    const t = typeOf();
    if (!t || Number(v) <= t.left) return '';
    return t.left ? `Only ${t.left} ${t.name} seats left.` : `${t.name} tickets are sold out.`;
  },
  person: v => /^\p{L}+(\s+\p{L}+)+$/u.test(v.trim()) ? '' : 'Enter first and last name, letters only.',
  promo: v => v && !promos[v.trim().toUpperCase()] ? 'Unknown promo code.' : ''
};
const fields = [...form.elements].filter(f => f.name);

function buildOptions() {
  const ev = form.elements.event, ty = form.elements.type;
  ev.textContent = ty.textContent = '';
  ev.append(new Option('Choose event', ''));
  events.forEach(n => ev.append(new Option(n, n)));
  ty.append(new Option('Choose type', ''));
  types.forEach(t => ty.append(new Option(`${t.name} - $${t.price} (${t.left} left)`, t.id)));
}

function validate(f) {
  const msg = !f.validity.valid ? f.validationMessage : (rules[f.name] ? rules[f.name](f.value) : '');
  f.setAttribute('aria-invalid', msg ? 'true' : 'false');
  f.classList.toggle('invalid', Boolean(msg));
  $('err-' + f.name).textContent = msg;
  return !msg;
}

function preview() {
  ['event', 'date', 'qty', 'person', 'email'].forEach(n =>
    $('p-' + n).textContent = form.elements[n].value || '—');
  const t = typeOf(), off = discount();
  const total = t ? t.price * (Number(form.elements.qty.value) || 0) * (100 - off) / 100 : 0;
  $('p-type').textContent = t ? t.name : '—';
  $('p-total').textContent = `$${total.toFixed(2)}` + (off ? ` (-${off}%)` : '');
}

function showResult(t) {
  const box = $('result');
  const add = (tag, cls, text) => {
    const e = document.createElement(tag);
    e.className = cls;
    e.textContent = text;
    box.append(e);
  };
  const f = form.elements;
  box.textContent = '';
  add('h2', '', '✅ Ticket booked!');
  add('p', '', `${f.person.value}, ${f.qty.value} × ${t.name} for ${f.event.value} on ${f.date.value}.`);
  add('p', '', 'Total: ' + $('p-total').textContent);
  add('p', 'code', 'TK-' + Math.random().toString(36).slice(2, 8).toUpperCase());
  box.className = 'box done-box';
}

fields.forEach(f => {
  f.addEventListener('blur', () => { touched.add(f); validate(f); });
  f.addEventListener('input', () => {
    fields.filter(x => touched.has(x)).forEach(validate);
    preview();
  });
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const bad = fields.filter(f => { touched.add(f); return !validate(f); });
  if (bad.length) {
    $('summary').textContent = `${bad.length} error(s) found. Please fix them.`;
    bad[0].focus();
    return;
  }
  $('summary').textContent = '';
  const t = typeOf();
  showResult(t);
  t.left -= Number(form.elements.qty.value);
  buildOptions();
  form.reset();
  touched.clear();
  fields.forEach(f => { f.removeAttribute('aria-invalid'); f.classList.remove('invalid'); $('err-' + f.name).textContent = ''; });
  preview();
});

buildOptions();
preview();
