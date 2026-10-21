const LIMIT = 3;
const COLUMNS = [
  { key: 'todo', title: 'To do' },
  { key: 'doing', title: 'In progress' },
  { key: 'done', title: 'Done' }
];
const cards = [
  { id: 1, title: 'Create GitHub repo', tag: 'docs', priority: 1, hours: 1, status: 'done', urgent: false },
  { id: 2, title: 'Write HTML pages', tag: 'html', priority: 3, hours: 4, status: 'done', urgent: false },
  { id: 3, title: 'Style the header', tag: 'css', priority: 2, hours: 2, status: 'done', urgent: false },
  { id: 4, title: 'Build the game', tag: 'js', priority: 3, hours: 6, status: 'doing', urgent: true },
  { id: 5, title: 'Form validation', tag: 'js', priority: 3, hours: 5, status: 'doing', urgent: true },
  { id: 6, title: 'Design a logo', tag: 'design', priority: 2, hours: 3, status: 'todo', urgent: false },
  { id: 7, title: 'Add dark theme', tag: 'css', priority: 1, hours: 2, status: 'todo', urgent: false },
  { id: 8, title: 'Test on mobile', tag: 'qa', priority: 2, hours: 2, status: 'todo', urgent: false },
  { id: 9, title: 'Write the report', tag: 'docs', priority: 2, hours: 3, status: 'todo', urgent: true },
  { id: 10, title: 'Add a favicon', tag: 'design', priority: 1, hours: 1, status: 'todo', urgent: false },
  { id: 11, title: 'Fix console errors', tag: 'qa', priority: 3, hours: 2, status: 'todo', urgent: false }
];
let sortOn = false;
const $ = id => document.getElementById(id);

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function say(text, type) {
  $('msg').textContent = text;
  $('msg').className = 'msg ' + type;
}

function moveButton(card, dir, label) {
  const b = el('button', 'small', label);
  b.dataset.id = card.id;
  b.dataset.dir = dir;
  b.setAttribute('aria-label', dir < 0 ? 'Move left' : 'Move right');
  return b;
}

function render() {
  const text = $('search').value.trim().toLowerCase();
  const tag = $('tag').value;
  const shown = cards.filter(c => (tag === 'all' || c.tag === tag) && c.title.toLowerCase().includes(text));
  if (sortOn) shown.sort((a, b) => b.priority - a.priority);

  $('board').textContent = '';
  COLUMNS.forEach((col, i) => {
    const list = shown.filter(c => c.status === col.key);
    const box = el('section', 'col');
    box.append(el('h2', '', `${col.title} (${list.length})`));
    if (!list.length) box.append(el('p', 'empty', 'No cards'));
    list.forEach(c => {
      const card = el('article', 'card p' + c.priority);
      card.classList.toggle('finished', c.status === 'done');
      card.append(el('h3', '', (c.urgent ? '🔥 ' : '') + c.title));
      card.append(el('p', 'muted', `#${c.tag} · priority ${c.priority} · ${c.hours}h`));
      if (i > 0) card.append(moveButton(c, -1, '◀'));
      if (i < COLUMNS.length - 1) card.append(moveButton(c, 1, '▶'));
      box.append(card);
    });
    $('board').append(box);
  });
  $('nothing').classList.toggle('hidden', shown.length > 0);

  let done = 0, hoursDone = 0, hoursAll = 0;
  for (const c of cards) {
    hoursAll += c.hours;
    if (c.status === 'done') { done++; hoursDone += c.hours; }
  }
  $('bar').max = cards.length;
  $('bar').value = done;
  $('pct').textContent = `${done}/${cards.length} cards, ${hoursDone}/${hoursAll} hours`;
}

$('board').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  const card = cards.find(c => c.id === Number(b.dataset.id));
  const from = COLUMNS.findIndex(col => col.key === card.status);
  const to = COLUMNS[from + Number(b.dataset.dir)].key;
  const inProgress = cards.filter(c => c.status === 'doing').length;
  if (to === 'doing' && inProgress >= LIMIT) {
    say(`Blocked: only ${LIMIT} cards can be in progress. Finish one first.`, 'error');
    return;
  }
  card.status = to;
  say(`"${card.title}" moved.`, 'success');
  render();
});

const tags = [];
for (const c of cards) if (!tags.includes(c.tag)) tags.push(c.tag);
['all', ...tags].forEach(t => $('tag').append(new Option(t === 'all' ? 'All tags' : t, t)));

$('search').addEventListener('input', render);
$('tag').addEventListener('change', render);
$('sort').addEventListener('click', () => {
  sortOn = !sortOn;
  $('sort').classList.toggle('active', sortOn);
  render();
});
render();
