const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 22;

/* ---------------- MAP TEMPLATE ---------------- */
const MAP_TEMPLATE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,0,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function freshMap() {
  return MAP_TEMPLATE.map(row => [...row]);
}

let map = freshMap();

canvas.width  = map[0].length * tileSize;
canvas.height = map.length    * tileSize;

/* ---------------- LEVEL CONFIG ---------------- */
const LEVEL_CONFIG = [
  {
    ghosts: [
      { x: 17, y: 1  },
      { x: 17, y: 13 },
    ],
    ghostInterval: 400,
    timeLimit: 120,
    label: "Level 1"
  },
  {
    ghosts: [
      { x: 17, y: 1  },
      { x: 17, y: 13 },
      { x: 1,  y: 13 },
    ],
    ghostInterval: 400,
    timeLimit: 100,
    label: "Level 2"
  },
  {
    ghosts: [
      { x: 17, y: 1  },
      { x: 17, y: 13 },
      { x: 1,  y: 13 },
      { x: 9,  y: 7  },
    ],
    ghostInterval: 400,
    timeLimit: 90,
    label: "Level 3"
  },
  {
    ghosts: [
      { x: 17, y: 1  },
      { x: 17, y: 13 },
      { x: 1,  y: 13 },
      { x: 9,  y: 7  },
    ],
    ghostInterval: 200,
    timeLimit: 90,
    label: "Level 4 — Speed Run!"
  },
];

/* ---------------- STATE ---------------- */
let gameState    = "menu";
let score        = 0;
let lives        = 3;
let timeLeft     = LEVEL_CONFIG[0].timeLimit;
let currentLevel = 0;
let ghosts       = [];
let ghostMoveInterval = null;
let pelletsEatenThisLevel = 0;

const menuScreen     = document.getElementById("menuScreen");
const pauseScreen    = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

/* ---------------- PLAYER ---------------- */
let pacman = { x: 1, y: 1, dx: 0, dy: 0 };

/* ---------------- PELLETS ---------------- */
let totalPellets = 0;
function countPellets() {
  totalPellets = 0;
  map.forEach(r => r.forEach(c => { if (c === 0) totalPellets++; }));
}
countPellets();

/* ---------------- LEADERBOARD ---------------- */
let leaderboard = [
  { name: "Alex",   score: 120 },
  { name: "Jordan", score: 95  },
  { name: "Sam",    score: 80  },
  { name: "You",    score: 0   }
];

/* ---------------- POPUP ---------------- */
const popup   = document.getElementById("popup");
const title   = document.getElementById("popupTitle");
const text    = document.getElementById("popupText");
const closeBtn = document.getElementById("closePopupBtn");

function openPopup(type) {
  popup.classList.remove("hidden");
  if (type === "speed") {
    title.textContent = "⚡ Speed Boost";
    text.textContent  = "Increases movement speed in-game.";
  }
  if (type === "lives") {
    title.textContent = "❤️ Extra Lives";
    text.textContent  = "Adds extra chances when hit by ghosts.";
  }
}
function closePopup() { popup.classList.add("hidden"); }
closeBtn.addEventListener("click", closePopup);

/* ---------------- TIMER ---------------- */
function updateTimer() {
  const el = document.getElementById("timer");
  el.textContent = timeLeft;
  el.style.color = "white";
  if (timeLeft <= 30) el.style.color = "orange";
  if (timeLeft <= 10) el.style.color = "red";

  if (timeLeft <= 0) {
    gameState = "gameover";
    showGameOver();
  }
}

/* ---------------- LEADERBOARD ---------------- */
function updateLeaderboard() {
  const list = document.getElementById("scoresList");
  leaderboard = leaderboard.map(p => ({
    ...p,
    score: p.name === "You"
      ? score
      : p.score + Math.floor(Math.random() * 3)
  }));
  leaderboard.sort((a, b) => b.score - a.score);
  list.innerHTML = "";
  leaderboard.forEach((p, i) => {
    const li = document.createElement("li");
    if (p.name === "You") {
      li.style.color = i === 0 ? "lime" : i <= 1 ? "gold" : "red";
    }
    li.textContent = `${p.name}: ${p.score}`;
    list.appendChild(li);
  });
}

/* ---------------- HUD ---------------- */
function updateHUD() {
  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;
  const lvlEl = document.getElementById("levelLabel");
  if (lvlEl) lvlEl.textContent = LEVEL_CONFIG[currentLevel].label;
}

/* ---------------- DRAW ---------------- */
function drawMap() {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === 1) {
        ctx.fillStyle = "blue";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else if (map[y][x] === 0) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x * tileSize + 11, y * tileSize + 11, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawPacman() {
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(pacman.x * tileSize + 11, pacman.y * tileSize + 11, 10, 0, Math.PI * 2);
  ctx.fill();
}

function drawGhosts() {
  ctx.fillStyle = "red";
  ghosts.forEach(g => {
    ctx.fillRect(g.x * tileSize + 4, g.y * tileSize + 4, 14, 14);
  });
}

/* ---------------- GAME LOGIC ---------------- */
function movePacman() {
  let nx = pacman.x + pacman.dx;
  let ny = pacman.y + pacman.dy;
  if (map[ny][nx] !== 1) {
    pacman.x = nx;
    pacman.y = ny;
    if (map[ny][nx] === 0) {
      score++;
      pelletsEatenThisLevel++;
      map[ny][nx] = 2;
    }
  }
}

function moveGhosts() {
  const dirs = [
    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
    { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
  ];
  ghosts.forEach(g => {
    const d  = dirs[Math.floor(Math.random() * dirs.length)];
    const nx = g.x + d.dx;
    const ny = g.y + d.dy;
    if (map[ny][nx] !== 1) { g.x = nx; g.y = ny; }
  });
}

function checkCollision() {
  ghosts.forEach(g => {
    if (g.x === pacman.x && g.y === pacman.y) {
      lives--;
      pacman.x = 1; pacman.y = 1;
      if (lives <= 0) {
        gameState = "gameover";
        showGameOver();
      }
    }
  });
}

function checkWin() {
  if (pelletsEatenThisLevel < totalPellets) return;

  if (currentLevel < LEVEL_CONFIG.length - 1) {
    currentLevel++;
    loadLevel(currentLevel);
  } else {
    gameState = "gameover";
    const finalEl = document.getElementById("finalMessage");
    if (finalEl) finalEl.textContent = "🏆 YOU BEAT ALL 4 LEVELS!";
    showGameOver();
  }
}

/* ---------------- LOAD LEVEL ---------------- */
function loadLevel(n) {
  const cfg = LEVEL_CONFIG[n];
  pelletsEatenThisLevel = 0;

  map = freshMap();
  countPellets();

  pacman = { x: 1, y: 1, dx: 0, dy: 0 };
  ghosts = cfg.ghosts.map(g => ({ ...g }));
  timeLeft = cfg.timeLimit;

  if (ghostMoveInterval !== null) clearInterval(ghostMoveInterval);
  ghostMoveInterval = setInterval(() => {
    if (gameState === "playing") moveGhosts();
  }, cfg.ghostInterval);

  const lvlEl = document.getElementById("levelLabel");
  if (lvlEl) {
    lvlEl.textContent = cfg.label;
    lvlEl.style.animation = "none";
    void lvlEl.offsetWidth;
    lvlEl.style.animation = "levelFlash 1.5s ease-out";
  }

  gameState = "playing";
}

/* ---------------- GAME OVER ---------------- */
function showGameOver() {
  gameOverScreen.classList.remove("hidden");

  if (!document.getElementById("purchasePanel")) {
    const panel = document.createElement("div");
    panel.id = "purchasePanel";
    panel.style.cssText = `
      margin-top: 12px;
      background: #1a1a2e;
      border: 2px solid #e94560;
      border-radius: 8px;
      padding: 14px;
      text-align: center;
      color: white;
      font-family: monospace;
    `;
    panel.innerHTML = `
      <p style="color:#ffd700;font-size:1.1em;margin:0 0 10px">
        Don't lose your progress on <strong>${LEVEL_CONFIG[currentLevel].label}</strong>!
      </p>
      <button onclick="purchaseLives()" style="
        background:#e94560;color:white;border:none;border-radius:6px;
        padding:10px 18px;margin:4px;cursor:pointer;font-size:0.95em;">
        ❤️ Buy 3 Lives — $0.99
      </button>
      <button onclick="purchaseTime()" style="
        background:#f5a623;color:black;border:none;border-radius:6px;
        padding:10px 18px;margin:4px;cursor:pointer;font-size:0.95em;">
        ⏱ Buy +30s — $1.99
      </button>
      <p style="font-size:0.75em;color:#aaa;margin:8px 0 0">
        Or <a href="#" onclick="restartGame()" style="color:#e94560">start over from Level 1</a>
      </p>
    `;
    gameOverScreen.appendChild(panel);
  }
}

window.purchaseLives = function () {
  lives = 3;
  gameOverScreen.classList.add("hidden");
  document.getElementById("purchasePanel")?.remove();
  loadLevel(currentLevel);
};

window.purchaseTime = function () {
  timeLeft += 30;
  lives = lives > 0 ? lives : 1;
  gameOverScreen.classList.add("hidden");
  document.getElementById("purchasePanel")?.remove();
  loadLevel(currentLevel);
};

/* ---------------- ADS ---------------- */
function createAds() {
  document.querySelectorAll(".gameAd").forEach(el => el.remove());

  const btn = document.createElement("button");
  btn.id = "removeAdsBtn";
  btn.className = "gameAd";
  btn.onclick = RemoveAds;
  btn.style.cssText = "position:fixed; top:10px; left:50%; transform:translateX(-50%); z-index:999999; background:linear-gradient(45deg,#f1c40f,#f39c12); color:black; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;";
  btn.textContent = "Remove Ads";
  document.body.appendChild(btn);

  const ad1 = new Image();
  ad1.className = "gameAd";
  ad1.src = "adsidebar.jpg";
  ad1.style.cssText = "position:fixed; left:0; top:0; width:160px; height:100vh; z-index:99999;";
  document.body.appendChild(ad1);

  const ad2 = new Image();
  ad2.className = "gameAd";
  ad2.src = "adsidebar2.jpg";
  ad2.style.cssText = "position:fixed; right:0; top:0; width:160px; height:100vh; z-index:99999;";
  document.body.appendChild(ad2);

  const ad3 = new Image();
  ad3.className = "gameAd";
  ad3.src = "lowbar.ad.jpg";
  ad3.style.cssText = "position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:60%; max-width:600px; height:120px; z-index:99999;";
  document.body.appendChild(ad3);
}

function RemoveAds() {
  document.querySelectorAll(".gameAd").forEach(el => el.remove());
}

/* ---------------- INPUT ---------------- */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (gameState === "playing") {
      gameState = "paused";
      pauseScreen.classList.remove("hidden");
      createAds();
    } else if (gameState === "paused") {
      gameState = "playing";
      pauseScreen.classList.add("hidden");
      document.querySelectorAll(".gameAd").forEach(el => el.remove());
    }
    return;
  }

  if (gameState !== "playing") return;
  if (e.key === "ArrowUp")    pacman = { ...pacman, dx: 0,  dy: -1 };
  if (e.key === "ArrowDown")  pacman = { ...pacman, dx: 0,  dy:  1 };
  if (e.key === "ArrowLeft")  pacman = { ...pacman, dx: -1, dy:  0 };
  if (e.key === "ArrowRight") pacman = { ...pacman, dx: 1,  dy:  0 };
});

/* ---------------- GAME LOOP ---------------- */
function gameLoop() {
  if (gameState !== "playing") return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePacman();
  checkCollision();
  checkWin();

  drawMap();
  drawPacman();
  drawGhosts();

  updateHUD();
  updateLeaderboard();
  updateTimer();
}

setInterval(gameLoop, 160);

setInterval(() => {
  if (gameState === "playing") timeLeft--;
}, 1000);

/* ---------------- MENU FUNCTIONS ---------------- */
function startGame() {
  menuScreen.classList.add("hidden");
  currentLevel = 0;
  score = 0;
  lives = 3;
  loadLevel(0);
}

function restartGame() {
  location.reload();
}

window.endGame = function () {
  gameState = "gameover";
  showGameOver();
};

window.resumeGame = function () {
  gameState = "playing";
  pauseScreen.classList.add("hidden");
  document.querySelectorAll(".gameAd").forEach(el => el.remove());
};