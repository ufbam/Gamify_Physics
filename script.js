const levelListEl = document.getElementById('levelList');
const playArea = document.getElementById('playArea');
const instructionsCard = document.getElementById('instructionsCard');
const quizCard = document.getElementById('quizCard');
const statusCard = document.getElementById('statusCard');
const levelTitle = document.getElementById('levelTitle');
const levelSummary = document.getElementById('levelSummary');
const levelGoal = document.getElementById('levelGoal');
const levelCategory = document.getElementById('levelCategory');
const progressText = document.getElementById('progressText');
const progressBarFill = document.getElementById('progressBarFill');
const resetButton = document.getElementById('resetButton');
const resumeButton = document.getElementById('resumeButton');

const STORAGE_KEY = 'gamify_physics_progress';

const levels = [
  {
    id: 'speed',
    title: 'Measure Speed',
    category: 'Movement by Forces',
    summary: 'Drag the runner, set a timer, and discover how distance and time build speed.',
    goal: 'Hit a speed between 6 and 8 m/s.',
    intro: [
      'Preview the meter markings and time slider before you run the experiment.',
      'Notice how the track ruler helps you measure distance at a glance.',
    ],
    setup: setupSpeedLevel,
  },
  {
    id: 'acceleration',
    title: 'Acceleration vs. Speed',
    category: 'Movement by Forces',
    summary: 'Stack pushes to see how velocity changes when acceleration is present.',
    goal: 'Reach 10 m/s in five pushes or fewer.',
    intro: [
      'Read how acceleration compounds with every push before the cart rolls.',
      'Watch the speed gauge fill as you add or remove force.',
    ],
    setup: setupAccelerationLevel,
  },
  {
    id: 'graphs',
    title: 'Graph Motion',
    category: 'Thinking Scientifically',
    summary: 'Tune a constant speed and watch position-time data draw itself.',
    goal: 'Produce a slope near 2 m/s on the graph.',
    intro: [
      'Preview the graph grid so you know which axes you are reading.',
      'See where the runner will start before plotting the data.',
    ],
    setup: setupGraphLevel,
  },
  {
    id: 'direction',
    title: 'Changing Direction',
    category: 'Movement by Forces',
    summary: 'Adjust a velocity vector and keep speed steady while steering.',
    goal: 'Aim the vector north while holding speed between 5–7 m/s.',
    intro: [
      'Glance at the compass labels so you know what 90° represents.',
      'You will rotate the arrow without letting the speed bar drift.',
    ],
    setup: setupDirectionLevel,
  },
  {
    id: 'friction',
    title: 'Forces & Friction',
    category: 'Movement by Forces',
    summary: 'Slide a puck on different surfaces to feel how resistive forces slow motion.',
    goal: 'Stop within 40 px of the finish flag.',
    intro: [
      'Read how friction changes the “heat bar” before sending the puck.',
      'Use the ruler to see how far you coast toward the flag.',
    ],
    setup: setupFrictionLevel,
  },
  {
    id: 'waves',
    title: 'Waves & Types',
    category: 'Waves',
    summary: 'Toggle between transverse and longitudinal views, then shape the wave.',
    goal: 'Show a transverse wave with amplitude between 30–40.',
    intro: [
      'Skim the wave grid and baseline before drawing any energy.',
      'Notice how the amplitude ruler shows energy level changes.',
    ],
    setup: setupWaveLevel,
  },
];

let unlocked = loadProgress();
let currentLevelId = levels[0].id;

function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return new Set(JSON.parse(saved));
  }
  return new Set([levels[0].id]);
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unlocked)));
}

function updateProgressUI() {
  const unlockedCount = unlocked.size;
  progressText.textContent = `${unlockedCount} / ${levels.length}`;
  const percent = Math.min((unlockedCount / levels.length) * 100, 100);
  progressBarFill.style.width = `${percent}%`;
}

function renderLevelList() {
  levelListEl.innerHTML = '';
  levels.forEach((lvl, index) => {
    const li = document.createElement('li');
    const number = document.createElement('div');
    number.className = 'badge';
    number.textContent = `Lv ${index + 1}`;
    const text = document.createElement('div');
    text.innerHTML = `<strong>${lvl.title}</strong><br><span class="subtitle">${lvl.category}</span>`;
    const status = document.createElement('div');
    status.className = 'badge';
    status.textContent = unlocked.has(lvl.id) ? 'Unlocked' : 'Locked';

    if (!unlocked.has(lvl.id)) {
      li.classList.add('locked');
    }
    if (lvl.id === currentLevelId) {
      li.classList.add('active');
    }

    li.append(number, text, status);
    li.addEventListener('click', () => {
      if (!unlocked.has(lvl.id)) return;
      currentLevelId = lvl.id;
      renderLevelList();
      loadLevel(lvl.id);
    });

    levelListEl.appendChild(li);
  });
}

function createInfoPills(items) {
  const grid = document.createElement('div');
  grid.className = 'info-grid';
  items.forEach((item) => {
    const pill = document.createElement('div');
    pill.className = 'info-pill';
    pill.innerHTML = `<div class="label">${item.label}</div><div class="metric">${item.value}</div><p class="subtitle">${item.note}</p>`;
    grid.appendChild(pill);
  });
  return grid;
}

function setStatus(message, type = 'warn') {
  statusCard.innerHTML = `<h3>Status</h3><p class="${type === 'good' ? 'status-good' : type === 'bad' ? 'status-bad' : 'status-warn'}">${message}</p>`;
}

function completeLevel(levelId) {
  if (!unlocked.has(levelId)) {
    unlocked.add(levelId);
  }
  const levelIndex = levels.findIndex((l) => l.id === levelId);
  const next = levels[levelIndex + 1];
  if (next) {
    unlocked.add(next.id);
  }
  saveProgress();
  updateProgressUI();
  renderLevelList();
  setStatus('Progress saved! A new level unlocked.', 'good');
}

function clearStage() {
  playArea.innerHTML = '';
  instructionsCard.innerHTML = '';
  quizCard.innerHTML = '';
  statusCard.innerHTML = '';
}

function loadLevel(id) {
  const lvl = levels.find((l) => l.id === id);
  if (!lvl) return;
  clearStage();

  levelTitle.textContent = lvl.title;
  levelSummary.textContent = lvl.summary;
  levelGoal.textContent = lvl.goal;
  levelCategory.textContent = lvl.category;

  showIntro(lvl, () => {
    playArea.innerHTML = '';
    lvl.setup();
    renderLevelList();
  });
  renderLevelList();
}

function showIntro(level, onStart) {
  const overlay = document.createElement('div');
  overlay.className = 'play-overlay';
  const card = document.createElement('div');
  card.className = 'intro-card';
  card.innerHTML = `
    <p class="eyebrow">Mission Brief</p>
    <h3>${level.title}</h3>
    <p class="subtitle">${level.summary}</p>
  `;

  const list = document.createElement('ul');
  list.className = 'intro-list';
  (level.intro || []).forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
  card.appendChild(list);

  const startBtn = document.createElement('button');
  startBtn.textContent = 'Enter the lab';
  startBtn.className = 'primary';
  startBtn.addEventListener('click', onStart);
  card.appendChild(startBtn);

  overlay.appendChild(card);
  playArea.appendChild(overlay);

  instructionsCard.innerHTML = '<h3>Read first</h3><p>Start the lab to reveal controls and track your status.</p>';
  quizCard.innerHTML = '<h3>Checkpoint</h3><p>Quizzes appear after you begin.</p>';
  statusCard.innerHTML = '<h3>Status</h3><p class="status-warn">Click enter to load the interactive lab.</p>';
}

function addTrackRuler(track, divisions, unit = 'm') {
  const ruler = document.createElement('div');
  ruler.className = 'ruler';
  for (let i = 0; i <= divisions; i += 1) {
    const tick = document.createElement('div');
    tick.className = 'tick';
    tick.style.left = `${(i / divisions) * 100}%`;
    const label = document.createElement('span');
    label.className = 'tick-label';
    label.textContent = `${i}${unit}`;
    tick.appendChild(label);
    ruler.appendChild(tick);
  }
  track.appendChild(ruler);
}

function createGauge(label, unit) {
  const wrap = document.createElement('div');
  wrap.className = 'gauge';
  wrap.innerHTML = `<div class="label">${label}</div>`;
  const bar = document.createElement('div');
  bar.className = 'gauge-bar';
  const fill = document.createElement('div');
  fill.className = 'gauge-fill';
  const value = document.createElement('span');
  value.className = 'gauge-value';
  value.textContent = `0 ${unit}`;
  bar.appendChild(fill);
  wrap.append(bar, value);
  return { wrap, fill, value };
}

// Level implementations
function setupSpeedLevel() {
  playArea.innerHTML = '<div class="track"></div>';
  const track = playArea.querySelector('.track');
  const runner = document.createElement('div');
  runner.className = 'runner';
  track.appendChild(runner);
  addTrackRuler(track, 10, 'm');
  const baseX = track.clientWidth * 0.1;
  runner.style.left = `${baseX}px`;
  runner.style.top = '50%';

  let dragging = false;
  let offsetX = 0;
  const pxPerMeter = 6;
  const timeInput = document.createElement('input');
  timeInput.type = 'range';
  timeInput.min = 1;
  timeInput.max = 12;
  timeInput.value = 4;
  const timeLabel = document.createElement('p');
  const dataPills = createInfoPills([
    { label: 'Known', value: 'Speed = distance / time', note: 'Drag distance, slide time.' },
    { label: 'Goal', value: '6 – 8 m/s', note: 'Within band unlocks next level.' },
  ]);

  const info = document.createElement('div');
  info.append(timeLabel, timeInput, dataPills);
  const speedGauge = createGauge('Measured speed', 'm/s');
  info.appendChild(speedGauge.wrap);
  instructionsCard.innerHTML = '<h3>Experiment</h3><p>Drag the runner to set a travel distance, then slide the timer to compute speed.</p>';
  instructionsCard.appendChild(info);

  const quiz = document.createElement('div');
  quiz.className = 'quiz';
  const speedLabel = document.createElement('p');
  const checkBtn = document.createElement('button');
  checkBtn.textContent = 'Check speed band';
  checkBtn.className = 'primary';
  quiz.append(speedLabel, checkBtn);
  quizCard.innerHTML = '<h3>Checkpoint</h3>'; 
  quizCard.appendChild(quiz);

  function updateReadout() {
    const distance = Math.max(0, runner.offsetLeft - baseX);
    const meters = Math.round(distance / pxPerMeter);
    const time = Number(timeInput.value);
    const speed = meters / time;
    timeLabel.textContent = `Timer: ${time.toFixed(1)} s | Distance: ${meters} m`;
    speedLabel.textContent = `Speed: ${speed.toFixed(2)} m/s`;
    const percent = Math.min(speed / 12, 1) * 100;
    speedGauge.fill.style.width = `${percent}%`;
    speedGauge.value.textContent = `${speed.toFixed(2)} m/s`;
    return { speed };
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  runner.addEventListener('pointerdown', (e) => {
    dragging = true;
    runner.setPointerCapture(e.pointerId);
    offsetX = e.clientX - runner.getBoundingClientRect().left;
  });

  runner.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = track.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left - offsetX, 0, rect.width - runner.clientWidth);
    runner.style.left = `${x}px`;
    updateReadout();
  });

  runner.addEventListener('pointerup', (e) => {
    dragging = false;
    runner.releasePointerCapture(e.pointerId);
  });

  timeInput.addEventListener('input', updateReadout);
  updateReadout();

  checkBtn.addEventListener('click', () => {
    const { speed } = updateReadout();
    if (speed >= 6 && speed <= 8) {
      setStatus('Great work! You measured speed in the target band.', 'good');
      completeLevel('speed');
    } else {
      setStatus('Adjust distance or time to land between 6–8 m/s.', 'warn');
    }
  });
}

function setupAccelerationLevel() {
  playArea.innerHTML = '<div class="track"></div>';
  const track = playArea.querySelector('.track');
  const cart = document.createElement('div');
  cart.className = 'cart';
  cart.style.left = '10%';
  cart.style.top = '45%';
  track.appendChild(cart);
  addTrackRuler(track, 8, 'm');

  let velocity = 0;
  let pushes = 0;
  const velocityLabel = document.createElement('p');
  const pushesLabel = document.createElement('p');
  const pushButton = document.createElement('button');
  pushButton.textContent = 'Push cart (+2 m/s)';
  pushButton.className = 'primary';
  const brakeButton = document.createElement('button');
  brakeButton.textContent = 'Brake (-1 m/s)';
  brakeButton.className = 'ghost';
  const velocityGauge = createGauge('Velocity', 'm/s');

  instructionsCard.innerHTML = '<h3>Experiment</h3><p>Every push adds acceleration. Keep track of how velocity changes over each push.</p>';
  const info = createInfoPills([
    { label: 'Acceleration', value: 'Δv / Δt', note: 'Pushing changes velocity.' },
    { label: 'Target speed', value: '10 m/s', note: 'Reach it in ≤ 5 pushes.' },
  ]);
  instructionsCard.append(info);

  const controls = document.createElement('div');
  controls.className = 'hero-actions';
  controls.append(pushButton, brakeButton);
  quizCard.innerHTML = '<h3>Checkpoint</h3>';
  quizCard.append(velocityLabel, pushesLabel, velocityGauge.wrap, controls);

  function render() {
    velocityLabel.textContent = `Velocity: ${velocity.toFixed(1)} m/s`;
    pushesLabel.textContent = `Pushes used: ${pushes} / 5`;
    const trackRect = track.getBoundingClientRect();
    const progress = Math.min(velocity / 12, 1);
    cart.style.left = `${progress * (trackRect.width - 60) + 10}px`;
    velocityGauge.fill.style.width = `${progress * 100}%`;
    velocityGauge.value.textContent = `${velocity.toFixed(1)} m/s`;
  }

  function evaluate() {
    if (velocity >= 10 && pushes <= 5) {
      setStatus('You accelerated efficiently!', 'good');
      completeLevel('acceleration');
    } else if (pushes > 5) {
      setStatus('Too many pushes. Try braking and restarting.', 'bad');
    } else {
      setStatus('Keep pushing to hit 10 m/s without exceeding 5 pushes.', 'warn');
    }
  }

  pushButton.addEventListener('click', () => {
    pushes += 1;
    velocity += 2;
    render();
    evaluate();
  });

  brakeButton.addEventListener('click', () => {
    velocity = Math.max(0, velocity - 1.2);
    render();
    setStatus('Braking reduces velocity but also resets your push budget.', 'warn');
  });

  render();
}

function setupGraphLevel() {
  playArea.innerHTML = '<div class="track"></div>';
  const track = playArea.querySelector('.track');
  const runner = document.createElement('div');
  runner.className = 'runner';
  track.appendChild(runner);
  runner.style.left = '10%';
  runner.style.top = '60%';
  addTrackRuler(track, 6, 's');

  const canvas = document.createElement('canvas');
  canvas.width = track.clientWidth - 40;
  canvas.height = 180;
  canvas.className = 'wave-canvas';
  playArea.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const speedSlider = document.createElement('input');
  speedSlider.type = 'range';
  speedSlider.min = 0.5;
  speedSlider.max = 3.5;
  speedSlider.step = 0.1;
  speedSlider.value = 1.8;
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Run 4s simulation';
  startBtn.className = 'primary';
  const slopeLabel = document.createElement('p');

  instructionsCard.innerHTML = '<h3>Experiment</h3><p>Pick a constant speed and run the simulation. The position-time graph will plot automatically.</p>';
  const info = createInfoPills([
    { label: 'Graph axis', value: 'Position vs Time', note: 'Linear slope = constant speed.' },
    { label: 'Target slope', value: '~2 m/s', note: 'Between 1.5 and 2.5 m/s counts.' },
  ]);
  instructionsCard.append(info);

  quizCard.innerHTML = '<h3>Checkpoint</h3>';
  quizCard.append(speedSlider, startBtn, slopeLabel);

  let data = [];
  function resetGraph() {
    data = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= canvas.width; gx += canvas.width / 8) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, canvas.height);
      ctx.stroke();
    }
    for (let gy = 0; gy <= canvas.height; gy += canvas.height / 6) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(canvas.width, gy);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, canvas.height - 10);
    ctx.lineTo(canvas.width - 10, canvas.height - 10);
    ctx.stroke();
  }

  resetGraph();

  function plot() {
    if (data.length < 2) return;
    ctx.strokeStyle = '#66e4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const maxT = Math.max(...data.map((d) => d.t));
    const maxX = Math.max(...data.map((d) => d.x), 1);
    data.forEach((d, i) => {
      const px = 40 + (d.t / maxT) * (canvas.width - 60);
      const py = canvas.height - 10 - (d.x / maxX) * (canvas.height - 40);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  function runSimulation() {
    resetGraph();
    const speed = Number(speedSlider.value);
    const duration = 4;
    const samples = 40;
    data = [];
    for (let i = 0; i <= samples; i += 1) {
      const t = (i / samples) * duration;
      const x = speed * t;
      data.push({ t, x });
    }
    const finalX = speed * duration;
    runner.style.left = `${Math.min(0.1 + finalX * 10, 0.9) * 100}%`;
    plot();
    const slope = finalX / duration;
    slopeLabel.textContent = `Observed slope: ${slope.toFixed(2)} m/s`;
    if (slope >= 1.5 && slope <= 2.5) {
      setStatus('Line is nearly straight with target slope. Unlocking next!', 'good');
      completeLevel('graphs');
    } else {
      setStatus('Slope misses the target range. Adjust the speed slider.', 'warn');
    }
  }

  startBtn.addEventListener('click', runSimulation);
  runSimulation();
}

function setupDirectionLevel() {
  playArea.innerHTML = '<div class="track"></div><div class="arrow"></div>';
  const arrow = playArea.querySelector('.arrow');
  const compass = document.createElement('div');
  compass.className = 'compass';
  ['N', 'E', 'S', 'W'].forEach((dir) => {
    const label = document.createElement('span');
    label.textContent = dir;
    label.className = 'compass-label';
    label.dataset.dir = dir;
    compass.appendChild(label);
  });
  playArea.appendChild(compass);
  const speedSlider = document.createElement('input');
  speedSlider.type = 'range';
  speedSlider.min = 2;
  speedSlider.max = 10;
  speedSlider.step = 0.1;
  speedSlider.value = 6;
  const angleSlider = document.createElement('input');
  angleSlider.type = 'range';
  angleSlider.min = 0;
  angleSlider.max = 180;
  angleSlider.value = 90;
  const checkBtn = document.createElement('button');
  checkBtn.textContent = 'Lock in heading';
  checkBtn.className = 'primary';

  instructionsCard.innerHTML = '<h3>Experiment</h3><p>Direction changes velocity even if speed stays constant. Adjust the vector angle and magnitude.</p>';
  const info = createInfoPills([
    { label: 'Direction', value: 'Heading (°)', note: '0° = east, 90° = north.' },
    { label: 'Speed window', value: '5 – 7 m/s', note: 'Stay steady while turning.' },
  ]);
  instructionsCard.append(info);

  quizCard.innerHTML = '<h3>Checkpoint</h3>';
  const quiz = document.createElement('div');
  quiz.className = 'quiz';
  const angleLabel = document.createElement('p');
  const speedLabel = document.createElement('p');
  quiz.append(angleLabel, angleSlider, speedLabel, speedSlider, checkBtn);
  quizCard.append(quiz);

  function render() {
    const angle = Number(angleSlider.value);
    const speed = Number(speedSlider.value);
    angleLabel.textContent = `Heading: ${angle.toFixed(0)}°`;
    speedLabel.textContent = `Speed: ${speed.toFixed(1)} m/s`;
    arrow.style.transform = `translateY(-50%) rotate(${angle}deg)`;
    compass.style.transform = `rotate(-${angle}deg)`;
  }

  render();

  checkBtn.addEventListener('click', () => {
    const angle = Number(angleSlider.value);
    const speed = Number(speedSlider.value);
    if (angle >= 80 && angle <= 100 && speed >= 5 && speed <= 7) {
      setStatus('Perfect turn! You changed direction while keeping speed steady.', 'good');
      completeLevel('direction');
    } else {
      setStatus('Aim near 90° and hold speed in the 5–7 m/s window.', 'warn');
    }
  });

  angleSlider.addEventListener('input', render);
  speedSlider.addEventListener('input', render);
}

function setupFrictionLevel() {
  playArea.innerHTML = '<div class="track"></div><div class="target-line"></div>';
  const track = playArea.querySelector('.track');
  const target = playArea.querySelector('.target-line');
  const puck = document.createElement('div');
  puck.className = 'runner';
  puck.style.left = '30px';
  puck.style.top = '50%';
  track.appendChild(puck);
  addTrackRuler(track, 10, 'm');

  const frictionSlider = document.createElement('input');
  frictionSlider.type = 'range';
  frictionSlider.min = 0.01;
  frictionSlider.max = 0.2;
  frictionSlider.step = 0.005;
  frictionSlider.value = 0.05;
  const pushBtn = document.createElement('button');
  pushBtn.textContent = 'Push puck';
  pushBtn.className = 'primary';
  const frictionLabel = document.createElement('p');
  const stopLabel = document.createElement('p');
  const frictionHeat = document.createElement('div');
  frictionHeat.className = 'friction-heat';
  frictionHeat.innerHTML = '<div class="heat-fill"></div><span class="heat-value">μ</span>';

  instructionsCard.innerHTML = '<h3>Experiment</h3><p>Increase friction to slow faster or decrease it to slide longer. Try to coast to the finish flag.</p>';
  const info = createInfoPills([
    { label: 'Force pair', value: 'Push vs Friction', note: 'Friction opposes motion.' },
    { label: 'Target', value: 'Stop near flag', note: 'Within 40 px unlocks next level.' },
  ]);
  instructionsCard.append(info);

  quizCard.innerHTML = '<h3>Checkpoint</h3>';
  const quiz = document.createElement('div');
  quiz.className = 'quiz';
  quiz.append(frictionLabel, frictionSlider, frictionHeat, pushBtn, stopLabel);
  quizCard.append(quiz);

  let animationId = null;
  let velocity = 0;
  function cancel() {
    if (animationId) cancelAnimationFrame(animationId);
  }

  function updateLabels(stopX = null) {
    const mu = Number(frictionSlider.value);
    frictionLabel.textContent = `Friction: ${(mu * 100).toFixed(1)} N (scaled)`;
    if (stopX != null) {
      stopLabel.textContent = `Stopped at ${stopX.toFixed(0)} px`;
    }
    const fill = frictionHeat.querySelector('.heat-fill');
    const label = frictionHeat.querySelector('.heat-value');
    const percent = ((mu - Number(frictionSlider.min)) / (Number(frictionSlider.max) - Number(frictionSlider.min))) * 100;
    fill.style.width = `${percent}%`;
    label.textContent = `Heat: ${mu.toFixed(2)}`;
  }

  function simulate() {
    cancel();
    const friction = Number(frictionSlider.value);
    const rect = track.getBoundingClientRect();
    const targetX = rect.width - 80;
    let x = 30;
    velocity = 7;
    function step() {
      velocity -= friction;
      if (velocity < 0) velocity = 0;
      x += velocity;
      puck.style.left = `${x}px`;
      const stop = velocity <= 0 || x >= rect.width - 30;
      if (!stop) {
        animationId = requestAnimationFrame(step);
      } else {
        const distanceFromTarget = Math.abs(x - targetX);
        updateLabels(x);
        if (distanceFromTarget <= 40) {
          setStatus('Nice! You balanced push and friction to stop near the flag.', 'good');
          completeLevel('friction');
        } else {
          setStatus('Missed the target. Adjust friction and push again.', 'warn');
        }
      }
    }
    step();
  }

  pushBtn.addEventListener('click', simulate);
  frictionSlider.addEventListener('input', () => updateLabels());
  updateLabels();
}

function setupWaveLevel() {
  playArea.innerHTML = '';
  const canvas = document.createElement('canvas');
  canvas.width = playArea.clientWidth - 20;
  canvas.height = 240;
  canvas.className = 'wave-canvas';
  playArea.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const ampRuler = document.createElement('div');
  ampRuler.className = 'ruler vertical';
  for (let i = 0; i <= 6; i += 1) {
    const tick = document.createElement('div');
    tick.className = 'tick';
    tick.style.bottom = `${(i / 6) * 100}%`;
    const label = document.createElement('span');
    label.className = 'tick-label';
    label.textContent = `${i * 10}`;
    tick.appendChild(label);
    ampRuler.appendChild(tick);
  }
  playArea.appendChild(ampRuler);

  const typeSelect = document.createElement('select');
  ['Transverse', 'Longitudinal'].forEach((t) => {
    const option = document.createElement('option');
    option.value = t.toLowerCase();
    option.textContent = t;
    typeSelect.appendChild(option);
  });
  const ampSlider = document.createElement('input');
  ampSlider.type = 'range';
  ampSlider.min = 10;
  ampSlider.max = 60;
  ampSlider.step = 1;
  ampSlider.value = 34;
  const waveSlider = document.createElement('input');
  waveSlider.type = 'range';
  waveSlider.min = 40;
  waveSlider.max = 160;
  waveSlider.step = 2;
  waveSlider.value = 90;
  const checkBtn = document.createElement('button');
  checkBtn.textContent = 'Show wave & check';
  checkBtn.className = 'primary';

  instructionsCard.innerHTML = '<h3>Experiment</h3><p>Build a wave. Transverse waves move energy perpendicular to motion, longitudinal compress along motion.</p>';
  const info = createInfoPills([
    { label: 'Amplitude', value: 'Peak height', note: 'Raise or lower energy.' },
    { label: 'Wavelength', value: 'Distance between peaks', note: 'Stretch or compress waves.' },
  ]);
  instructionsCard.append(info);

  quizCard.innerHTML = '<h3>Checkpoint</h3>';
  const quiz = document.createElement('div');
  quiz.className = 'quiz';
  const typeLabel = document.createElement('p');
  const ampLabel = document.createElement('p');
  quiz.append(typeLabel, typeSelect, ampLabel, ampSlider, waveSlider, checkBtn);
  quizCard.append(quiz);

  function drawWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    for (let gx = 20; gx <= canvas.width - 20; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 10);
      ctx.lineTo(gx, canvas.height - 10);
      ctx.stroke();
    }
    for (let gy = 40; gy <= canvas.height - 40; gy += 40) {
      ctx.beginPath();
      ctx.moveTo(10, gy);
      ctx.lineTo(canvas.width - 10, gy);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, canvas.height / 2);
    ctx.lineTo(canvas.width - 20, canvas.height / 2);
    ctx.stroke();

    const amp = Number(ampSlider.value);
    const wavelength = Number(waveSlider.value);
    const type = typeSelect.value;
    ctx.strokeStyle = type === 'transverse' ? '#66e4ff' : '#ffc857';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 20; x <= canvas.width - 20; x += 2) {
      const relative = (x - 20) / wavelength;
      const y = type === 'transverse'
        ? canvas.height / 2 + Math.sin(relative * Math.PI * 2) * amp
        : canvas.height / 2 + Math.sin(relative * Math.PI * 2) * (amp / 6);
      if (x === 20) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (type === 'longitudinal') {
      for (let x = 20; x <= canvas.width - 40; x += wavelength / 4) {
        ctx.fillStyle = 'rgba(255, 200, 87, 0.25)';
        ctx.fillRect(x, canvas.height / 2 - amp / 4, 8, amp / 2);
      }
    }

    typeLabel.textContent = `Type: ${type === 'transverse' ? 'Transverse (up/down)' : 'Longitudinal (compressions)'}`;
    ampLabel.textContent = `Amplitude: ${amp}`;
    return { amp, type };
  }

  function checkWave() {
    const { amp, type } = drawWave();
    if (type === 'transverse' && amp >= 30 && amp <= 40) {
      setStatus('Wave matches the target description. Level complete!', 'good');
      completeLevel('waves');
    } else {
      setStatus('Use a transverse wave and set amplitude between 30–40.', 'warn');
    }
  }

  ampSlider.addEventListener('input', drawWave);
  waveSlider.addEventListener('input', drawWave);
  typeSelect.addEventListener('change', drawWave);
  checkBtn.addEventListener('click', checkWave);
  drawWave();
}

resetButton.addEventListener('click', () => {
  unlocked = new Set([levels[0].id]);
  saveProgress();
  updateProgressUI();
  renderLevelList();
  loadLevel(levels[0].id);
  setStatus('Progress cleared. Restarting from Level 1.', 'warn');
});

resumeButton.addEventListener('click', () => {
  const last = Array.from(unlocked).pop();
  currentLevelId = last || levels[0].id;
  loadLevel(currentLevelId);
});

updateProgressUI();
renderLevelList();
loadLevel(currentLevelId);
