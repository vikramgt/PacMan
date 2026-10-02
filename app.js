
const home = document.querySelector('#home');
const setup = document.querySelector('#setup');
const title = document.querySelector('#setup-title');
const rules = document.querySelector('#rules');
const players = document.querySelector('#players');
let selectedButton;
let selectedMode = 'single';

const modes = {
  single: { title: 'Solo run.', count: 1, rules: 'Collect food and avoid the four hunters. Your score is yours to beat.' },
  versus: { title: 'Friendly rivalry.', count: 2, rules: 'A two-minute round. Last player alive wins. If both survive, the higher food score wins; equal scores are a draw.' }
};

document.querySelectorAll('[data-mode]').forEach(button => {
  button.addEventListener('click', () => {
    selectedButton = button;
    selectedMode = button.dataset.mode;
    const mode = modes[button.dataset.mode];
    title.textContent = mode.title;
    rules.textContent = mode.rules;
    players.replaceChildren();
    for (let i = 1; i <= mode.count; i++) {
      const card = document.createElement('article');
      card.className = 'player';
      const heading = document.createElement('h2');
      heading.textContent = `Player ${i}`;
      const icon = document.createElement('span');
      icon.className = 'player-icon';
      icon.textContent = '▣';
      icon.setAttribute('aria-hidden', 'true');
      const description = document.createElement('p');
      description.textContent = 'Ready for preview. Phone pairing is temporarily skipped.';
      card.append(heading, icon, description);
      players.append(card);
    }
    home.hidden = true;
    setup.hidden = false;
    title.focus();
  });
});

// # = wall, . = pellet, o = power pellet.
// Spaces form the ghost house and starting area.
const mazeRows = [
  '#####################',
  '#o........#........o#',
  '#.##.####.#.####.##.#',
  '#...................#',
  '#.##.#.#######.#.##.#',
  '#....#....#....#....#',
  '####.####.#.####.####',
  '#....#.........#....#',
  '#.##.#.##   ##.#.##.#',
  '#......#     #......#',
  '#.##.#.#     #.#.##.#',
  '#....#.#     #.#....#',
  '####.#.#######.#.####',
  '#...................#',
  '#.##.####.#.####.##.#',
  '#..#.....   .....#..#',
  '##.#.#.#######.#.#.##',
  '#....#....#....#....#',
  '#.######.#.#.######.#',
  '#o.................o#',
  '#####################'
];

function drawMaze() {
  const canvas = document.querySelector('#maze');
  const tile = 26;
  const size = mazeRows.length * tile;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(size * ratio);
  canvas.height = Math.round(size * ratio);
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.fillStyle = '#101111';
  ctx.fillRect(0, 0, size, size);
  mazeRows.forEach((row, y) => [...row].forEach((cell, x) => {
    const cx = (x + .5) * tile;
    const cy = (y + .5) * tile;
    if (cell === '#') {
      ctx.fillStyle = '#202a28';
      ctx.strokeStyle = '#62796d';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(x * tile + 2, y * tile + 2, tile - 4, tile - 4, 5);
      ctx.fill(); ctx.stroke();
    } else if (cell === '.' || cell === 'o') {
      ctx.fillStyle = cell === 'o' ? '#f5ed63' : '#b9b89b';
      ctx.beginPath(); ctx.arc(cx, cy, cell === 'o' ? 5 : 2, 0, Math.PI * 2); ctx.fill();
    }
  }));
  function player(x, y, color, left = false) {
    ctx.save(); ctx.translate((x + .5) * tile, (y + .5) * tile);
    if (left) ctx.rotate(Math.PI);
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 10, .23 * Math.PI, 1.77 * Math.PI); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  player(selectedMode === 'single' ? 10 : 9, 15, '#f5ed63');
  if (selectedMode === 'versus') player(11, 15, '#65e2ec', true);
  ['#ff646a', '#ff9acb', '#65e2ec', '#ffb45e'].forEach((color, i) => {
    const x = (9 + i % 2) * tile + tile / 2;
    const y = (10 + Math.floor(i / 2)) * tile + tile / 2;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y - 2, 9, Math.PI, 0);
    ctx.lineTo(x + 9, y + 9); ctx.lineTo(x + 4, y + 5);
    ctx.lineTo(x, y + 9); ctx.lineTo(x - 4, y + 5); ctx.lineTo(x - 9, y + 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#101111'; ctx.fillRect(x - 5, y - 2, 3, 5); ctx.fillRect(x + 2, y - 2, 3, 5);
  });
}

document.querySelector('#next').addEventListener('click', () => {
  setup.hidden = true;
  document.querySelector('#maze-screen').hidden = false;
  document.querySelector('#game-mode').textContent = selectedMode === 'single' ? 'SINGLE PLAYER' : 'TWO PLAYERS';
  document.querySelector('#p2-score').hidden = selectedMode === 'single';
  document.querySelector('#timer').hidden = selectedMode === 'single';
  document.body.classList.remove('is-playing');
  document.querySelector('#exit-game').hidden = true;
  drawMaze();
  document.querySelector('#play-maze').focus();
});

const playMazeButton = document.querySelector('#play-maze');
const exitGameButton = document.querySelector('#exit-game');

playMazeButton.addEventListener('click', () => {
  document.body.classList.add('is-playing');
  exitGameButton.hidden = false;
  exitGameButton.focus();
});

exitGameButton.addEventListener('click', () => {
  document.body.classList.remove('is-playing');
  exitGameButton.hidden = true;
  playMazeButton.focus();
});

document.querySelector('#maze-back').addEventListener('click', () => {
  document.body.classList.remove('is-playing');
  exitGameButton.hidden = true;
  document.querySelector('#maze-screen').hidden = true;
  setup.hidden = false;
  document.querySelector('#next').focus();
});

document.querySelector('#back').addEventListener('click', () => {
  setup.hidden = true;
  home.hidden = false;
  selectedButton?.focus();
});


const muteToggle = document.querySelector('#mute-toggle');
const menuMusic = document.querySelector('#menu-music');

let soundMuted = false;
let musicEnabled = false;

menuMusic.volume = 0.25;

function updateSound() {
  document.querySelectorAll('audio, video').forEach(media => {
    media.muted = soundMuted;
  });

  muteToggle.textContent = soundMuted ? 'Unmute' : 'Mute';
  muteToggle.setAttribute('aria-pressed', String(soundMuted));
  muteToggle.setAttribute(
    'aria-label',
    soundMuted ? 'Unmute sound' : 'Mute sound'
  );
}

function syncMenuMusic() {
  const mazeVisible = !document.querySelector('#maze-screen').hidden;

  if (!musicEnabled || soundMuted || mazeVisible || document.hidden) {
    menuMusic.pause();
    return;
  }

  menuMusic.play().catch(error => {
    console.debug('Menu music could not start:', error);
  });
}

muteToggle.addEventListener('click', () => {
  soundMuted = !soundMuted;
  musicEnabled = true;
  updateSound();
  syncMenuMusic();
});

document.addEventListener('click', () => {
  musicEnabled = true;
  syncMenuMusic();
});

document.addEventListener('visibilitychange', syncMenuMusic);

updateSound();
syncMenuMusic();