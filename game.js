const LIVES = 3;
const WIN_STREAK = 10;
const games = [
  { name: 'Elden Ring', price: 60 }, { name: 'Cyberpunk 2077', price: 60 },
  { name: 'Hades', price: 25 }, { name: 'Celeste', price: 20 },
  { name: 'Hollow Knight', price: 15 }, { name: 'Stardew Valley', price: 15 },
  { name: 'Portal 2', price: 10 }, { name: 'Terraria', price: 10 },
  { name: 'Among Us', price: 5 }, { name: 'Doom Eternal', price: 40 },
  { name: 'Skyrim', price: 40 }, { name: 'FIFA 24', price: 70 }
];
const MIN_INDEX = 0;
const MAX_INDEX = games.length - 1;

let current, next, lives, streak, best = 0, playing;
const $ = id => document.getElementById(id);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function pick(exclude) {
  let i;
  do { i = rand(MIN_INDEX, MAX_INDEX); } while (i === exclude);
  return i;
}

function say(text, type) {
  $('msg').textContent = text;
  $('msg').className = 'msg ' + type;
}

function show() {
  $('lives').textContent = '❤'.repeat(lives) || '💀';
  $('streak').textContent = streak;
  $('best').textContent = best;
  $('cur-name').textContent = games[current].name;
  $('cur-price').textContent = '$' + games[current].price;
  $('next-name').textContent = games[next].name;
  document.querySelectorAll('[data-choice]').forEach(b => b.classList.toggle('off', !playing));
}

function start() {
  lives = LIVES;
  streak = 0;
  playing = true;
  current = pick(-1);
  next = pick(current);
  say('Make your guess!', 'success');
  show();
}

function guess(choice) {
  if (!playing) return say('The game is over. Press Restart.', 'error');
  if (choice !== 'higher' && choice !== 'lower') return say('Unknown move.', 'error');
  const a = games[current].price;
  const b = games[next].price;
  const right = (choice === 'higher' && b >= a) || (choice === 'lower' && b <= a);
  const info = `${games[next].name} costs $${b}. `;
  if (right) {
    streak++;
    best = Math.max(best, streak);
    say(info + 'Right!', 'success');
  } else {
    lives--;
    streak = 0;
    say(info + 'Wrong!', 'error');
  }
  if (streak === WIN_STREAK) {
    playing = false;
    say(`You win! ${WIN_STREAK} right guesses in a row!`, 'win');
  } else if (lives === 0) {
    playing = false;
    say(`Game over. Your best streak: ${best}.`, 'loss');
  }
  current = next;
  next = pick(current);
  show();
}

document.querySelectorAll('[data-choice]').forEach(b =>
  b.addEventListener('click', () => guess(b.dataset.choice)));
$('restart').addEventListener('click', start);
start();
