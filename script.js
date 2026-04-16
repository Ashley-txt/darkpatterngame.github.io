const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 22;

/* ---------------- MAP ---------------- */
const map = [
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

canvas.width = map[0].length * tileSize;
canvas.height = map.length * tileSize;

let gameState = "menu"; 
const menuScreen = document.getElementById("menuScreen");
/* ---------------- STATE ---------------- */
let score = 0;
let lives = 3;
gameState = "gameover";
let timeLeft = 120;

/* ---------------- PLAYER ---------------- */
let pacman = { x: 1, y: 1, dx: 0, dy: 0 };

let ghosts = [
  { x: 17, y: 1 },
  { x: 17, y: 13 },
  { x: 1, y: 13 }
];

/* ---------------- PELLETS ---------------- */
let totalPellets = 0;
map.forEach(r => r.forEach(c => {
  if (c === 0) totalPellets++;
}));

/* ---------------- LEADERBOARD ---------------- */
let leaderboard = [
  { name: "Alex", score: 120 },
  { name: "Jordan", score: 95 },
  { name: "Sam", score: 80 },
  { name: "You", score: 0 }
];

/* ---------------- POPUP (FIXED) ---------------- */
const popup = document.getElementById("popup");
const title = document.getElementById("popupTitle");
const text = document.getElementById("popupText");
const closeBtn = document.getElementById("closePopupBtn");

function openPopup(type) {
  popup.classList.remove("hidden");

  if (type === "speed") {
    title.textContent = "⚡ Speed Boost";
    text.textContent = "Increases movement speed in-game.";
  }

  if (type === "lives") {
    title.textContent = "❤️ Extra Lives";
    text.textContent = "Adds extra chances when hit by ghosts.";
  }
}

function closePopup() {
  popup.classList.add("hidden");
}

closeBtn.addEventListener("click", closePopup);

/* ---------------- TIMER ---------------- */
function updateTimer() {
  const el = document.getElementById("timer");
  el.textContent = timeLeft;

  el.style.color = "white";

  if (timeLeft <= 30) el.style.color = "orange";
  if (timeLeft <= 10) el.style.color = "red";

  if (timeLeft <= 0) {
    gameOver = true;
    alert("Time's up! Score: " + score);
    location.reload();
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
      if (i === 0) li.style.color = "lime";
      else if (i <= 1) li.style.color = "gold";
      else li.style.color = "red";
    }

    li.textContent = `${p.name}: ${p.score}`;
    list.appendChild(li);
  });
}

/* ---------------- HUD ---------------- */
function updateHUD() {
  document.getElementById("score").textContent = score;
  document.getElementById("lives").textContent = lives;
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

/* ---------------- GAME ---------------- */
function movePacman() {
  let nx = pacman.x + pacman.dx;
  let ny = pacman.y + pacman.dy;

  if (map[ny][nx] !== 1) {
    pacman.x = nx;
    pacman.y = ny;

    if (map[ny][nx] === 0) {
      score++;
      map[ny][nx] = 2;
    }
  }
}

function moveGhosts() {
  ghosts.forEach(g => {
    const dirs = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];

    const d = dirs[Math.floor(Math.random() * dirs.length)];
    let nx = g.x + d.dx;
    let ny = g.y + d.dy;

    if (map[ny][nx] !== 1) {
      g.x = nx;
      g.y = ny;
    }
  });
}

function checkCollision() {
  ghosts.forEach(g => {
    if (g.x === pacman.x && g.y === pacman.y) {
      lives--;
      pacman.x = 1;
      pacman.y = 1;

      if (lives <= 0) {
        alert("Game Over!");
        location.reload();
      }
    }
  });
}

function checkWin() {
  if (score === totalPellets) {
    alert("YOU WIN!");
    location.reload();
  }
}

const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
/* ---------------- INPUT ---------------- */
document.addEventListener("keydown", e => {
  //when escape is pressed game will enter a pause state -darren
  if (e.key === "Escape") {
    if (gameState === "playing") {
      gameState = "paused";
      pauseScreen.classList.remove("hidden");
    } else if (gameState === "paused") {
      gameState = "playing";
      pauseScreen.classList.add("hidden");
    }
    return;
  }

  if (gameState !== "playing") return;

  if (e.key === "ArrowUp") pacman = { ...pacman, dx: 0, dy: -1 };
  if (e.key === "ArrowDown") pacman = { ...pacman, dx: 0, dy: 1 };
  if (e.key === "ArrowLeft") pacman = { ...pacman, dx: -1, dy: 0 };
  if (e.key === "ArrowRight") pacman = { ...pacman, dx: 1, dy: 0 };
});

/* ---------------- LOOP ---------------- */
function gameLoop() {
  if (gameState !== "playing") return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePacman();
  moveGhosts();
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

// menu controls

function startGame() {
  gameState = "playing";
  menuScreen.classList.add("hidden");
}
window.endGame = function () {
  gameState = "gameover";
  gameOverScreen.classList.remove("hidden");
};
function restartGame() {
  location.reload();
}
window.resumeGame = function () {
  gameState = "playing";
  pauseScreen.classList.add("hidden");
};