const STORAGE_KEY = "points-challenge-player";
const tileSize = 22;

const avatarChoices = [
  { id: "spark", emoji: "⚡", name: "Spark" },
  { id: "orbit", emoji: "🪐", name: "Orbit" },
  { id: "pixel", emoji: "🟧", name: "Pixel" },
  { id: "nova", emoji: "🌟", name: "Nova" },
  { id: "pulse", emoji: "💠", name: "Pulse" },
  { id: "echo", emoji: "🔷", name: "Echo" }
];

const baseMap = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const defaultGameState = () => ({
  score: 0,
  lives: 3,
  gameOver: false,
  timeLeft: 120,
  speedMs: 160,
  map: cloneMap(baseMap),
  pacman: { x: 1, y: 1, dx: 0, dy: 0 },
  ghosts: [
    { x: 17, y: 1 },
    { x: 17, y: 13 },
    { x: 1, y: 13 }
  ],
  leaderboard: [
    { name: "Alex", score: 120 },
    { name: "Jordan", score: 95 },
    { name: "Sam", score: 80 },
    { name: "You", score: 0 }
  ],
  totalPellets: countPellets(baseMap)
});

const state = {
  player: loadPlayer(),
  game: defaultGameState(),
  intervals: {
    loop: null,
    timer: null
  }
};

const elements = {
  onboardingForm: document.getElementById("onboardingForm"),
  nicknameInput: document.getElementById("nicknameInput"),
  avatarOptions: document.getElementById("avatarOptions"),
  selectedAvatarPreview: document.getElementById("selectedAvatarPreview"),
  selectedNamePreview: document.getElementById("selectedNamePreview"),
  resetProfileBtn: document.getElementById("resetProfileBtn"),
  backToOnboardingBtn: document.getElementById("backToOnboardingBtn"),
  clearProfileBtn: document.getElementById("clearProfileBtn"),
  restartGameBtn: document.getElementById("restartGameBtn"),
  speedBoostBtn: document.getElementById("speedBoostBtn"),
  livesBoostBtn: document.getElementById("livesBoostBtn"),
  playerBadge: document.getElementById("playerBadge"),
  playerAvatarBadge: document.getElementById("playerAvatarBadge"),
  playerNameBadge: document.getElementById("playerNameBadge"),
  score: document.getElementById("score"),
  lives: document.getElementById("lives"),
  timer: document.getElementById("timer"),
  scoresList: document.getElementById("scoresList"),
  popup: document.getElementById("popup"),
  popupTitle: document.getElementById("popupTitle"),
  popupText: document.getElementById("popupText"),
  closePopupBtn: document.getElementById("closePopupBtn"),
  canvas: document.getElementById("gameCanvas"),
  screens: {
    onboarding: document.getElementById("screen-onboarding"),
    gameplay: document.getElementById("screen-gameplay"),
    outcome: document.getElementById("screen-outcome")
  }
};

const ctx = elements.canvas.getContext("2d");
elements.canvas.width = baseMap[0].length * tileSize;
elements.canvas.height = baseMap.length * tileSize;

function cloneMap(map) {
  return map.map((row) => [...row]);
}

function countPellets(map) {
  return map.flat().filter((cell) => cell === 0).length;
}

function avatarExists(avatarId) {
  return avatarChoices.some((avatar) => avatar.id === avatarId);
}

function getAvatarById(avatarId) {
  return avatarChoices.find((avatar) => avatar.id === avatarId) || avatarChoices[0];
}

function loadPlayer() {
  const fallback = {
    nickname: "",
    avatarId: avatarChoices[0].id
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved);
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
      avatarId: avatarExists(parsed.avatarId) ? parsed.avatarId : fallback.avatarId
    };
  } catch (error) {
    return fallback;
  }
}

function savePlayer(player) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
}

function renderAvatarOptions() {
  elements.avatarOptions.innerHTML = "";

  avatarChoices.forEach((avatar) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "avatar-option";
    button.dataset.avatarId = avatar.id;
    button.setAttribute("aria-pressed", String(state.player.avatarId === avatar.id));
    button.innerHTML = `
      <span class="avatar-option__emoji" aria-hidden="true">${avatar.emoji}</span>
      <span>
        <span class="avatar-option__name">${avatar.name}</span>
        <span class="avatar-option__hint">Profile icon</span>
      </span>
    `;

    button.addEventListener("click", () => {
      state.player.avatarId = avatar.id;
      updateSelectedProfilePreview();
      renderAvatarSelectionState();
    });

    elements.avatarOptions.appendChild(button);
  });
}

function renderAvatarSelectionState() {
  const buttons = elements.avatarOptions.querySelectorAll(".avatar-option");
  buttons.forEach((button) => {
    const isSelected = button.dataset.avatarId === state.player.avatarId;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

function updateSelectedProfilePreview() {
  const avatar = getAvatarById(state.player.avatarId);
  const displayName = state.player.nickname.trim() || "Player";
  elements.selectedAvatarPreview.textContent = avatar.emoji;
  elements.selectedNamePreview.textContent = displayName;
}

function updatePlayerBadge() {
  const hasProfile = state.player.nickname.trim().length > 0;
  if (!hasProfile) {
    elements.playerBadge.classList.add("hidden");
    return;
  }

  const avatar = getAvatarById(state.player.avatarId);
  elements.playerAvatarBadge.textContent = avatar.emoji;
  elements.playerNameBadge.textContent = state.player.nickname.trim();
  elements.playerBadge.classList.remove("hidden");
}

function showScreen(screenName) {
  Object.entries(elements.screens).forEach(([name, screen]) => {
    screen.classList.toggle("hidden", name !== screenName);
  });
}

function hydrateForm() {
  elements.nicknameInput.value = state.player.nickname;
  renderAvatarOptions();
  renderAvatarSelectionState();
  updateSelectedProfilePreview();
  updatePlayerBadge();

  if (state.player.nickname.trim()) {
    showScreen("gameplay");
    startGame();
  } else {
    showScreen("onboarding");
    stopGameLoop();
  }
}

function handleNicknameInput(event) {
  state.player.nickname = event.target.value;
  updateSelectedProfilePreview();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const trimmedNickname = elements.nicknameInput.value.trim();
  if (!trimmedNickname) {
    elements.nicknameInput.focus();
    return;
  }

  state.player.nickname = trimmedNickname;
  savePlayer(state.player);
  updateSelectedProfilePreview();
  updatePlayerBadge();
  showScreen("gameplay");
  restartGame();
}

function goToOnboarding() {
  stopGameLoop();
  updateSelectedProfilePreview();
  renderAvatarSelectionState();
  showScreen("onboarding");
  elements.nicknameInput.focus();
}

function resetProfile() {
  localStorage.removeItem(STORAGE_KEY);
  stopGameLoop();
  state.player = {
    nickname: "",
    avatarId: avatarChoices[0].id
  };
  state.game = defaultGameState();
  closePopup();
  hydrateForm();
  elements.nicknameInput.focus();
}

function openPopup(type) {
  elements.popup.classList.remove("hidden");

  if (type === "speed") {
    elements.popupTitle.textContent = "Speed Boost";
    elements.popupText.textContent = "Movement speed is temporarily increased so you can collect pellets faster.";
  }

  if (type === "lives") {
    elements.popupTitle.textContent = "Extra Lives";
    elements.popupText.textContent = "Adds one extra life to your run and makes recovery feel safer.";
  }
}

function closePopup() {
  elements.popup.classList.add("hidden");
}

function updateHUD() {
  elements.score.textContent = state.game.score;
  elements.lives.textContent = state.game.lives;
  elements.timer.textContent = state.game.timeLeft;
  elements.timer.style.color = "#eef3fb";

  if (state.game.timeLeft <= 30) {
    elements.timer.style.color = "#ffb347";
  }

  if (state.game.timeLeft <= 10) {
    elements.timer.style.color = "#ff6b57";
  }
}

function updateLeaderboard() {
  const playerName = state.player.nickname.trim() || "You";

  state.game.leaderboard = state.game.leaderboard.map((entry) => ({
    ...entry,
    name: entry.name === "You" ? playerName : entry.name,
    score: entry.name === "You"
      ? state.game.score
      : entry.score + Math.floor(Math.random() * 3)
  }));

  state.game.leaderboard.sort((a, b) => b.score - a.score);
  elements.scoresList.innerHTML = "";

  state.game.leaderboard.forEach((entry, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${entry.name}: ${entry.score}`;

    if (entry.name === playerName) {
      listItem.classList.add("leaderboard-entry", "leaderboard-entry--player");

      if (index === 0) {
        listItem.classList.add("leaderboard-entry--first");
      } else if (index <= 1) {
        listItem.classList.add("leaderboard-entry--top");
      } else {
        listItem.classList.add("leaderboard-entry--low");
      }
    }

    elements.scoresList.appendChild(listItem);
  });
}

function drawMap() {
  for (let y = 0; y < state.game.map.length; y += 1) {
    for (let x = 0; x < state.game.map[y].length; x += 1) {
      if (state.game.map[y][x] === 1) {
        ctx.fillStyle = "#1f5eff";
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
      } else if (state.game.map[y][x] === 0) {
        ctx.fillStyle = "#eef3fb";
        ctx.beginPath();
        ctx.arc(x * tileSize + 11, y * tileSize + 11, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawPacman() {
  ctx.fillStyle = "#ffd24d";
  ctx.beginPath();
  ctx.arc(state.game.pacman.x * tileSize + 11, state.game.pacman.y * tileSize + 11, 10, 0, Math.PI * 2);
  ctx.fill();
}

function drawGhosts() {
  ctx.fillStyle = "#ff4a57";
  state.game.ghosts.forEach((ghost) => {
    ctx.fillRect(ghost.x * tileSize + 4, ghost.y * tileSize + 4, 14, 14);
  });
}

function movePacman() {
  const nextX = state.game.pacman.x + state.game.pacman.dx;
  const nextY = state.game.pacman.y + state.game.pacman.dy;

  if (state.game.map[nextY]?.[nextX] !== 1) {
    state.game.pacman.x = nextX;
    state.game.pacman.y = nextY;

    if (state.game.map[nextY][nextX] === 0) {
      state.game.score += 1;
      state.game.map[nextY][nextX] = 2;
    }
  }
}

function moveGhosts() {
  state.game.ghosts.forEach((ghost) => {
    const directions = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];

    const direction = directions[Math.floor(Math.random() * directions.length)];
    const nextX = ghost.x + direction.dx;
    const nextY = ghost.y + direction.dy;

    if (state.game.map[nextY]?.[nextX] !== 1) {
      ghost.x = nextX;
      ghost.y = nextY;
    }
  });
}

function finishGame(message) {
  state.game.gameOver = true;
  stopGameLoop();
  window.alert(message);
}

function checkCollision() {
  state.game.ghosts.forEach((ghost) => {
    if (ghost.x === state.game.pacman.x && ghost.y === state.game.pacman.y) {
      state.game.lives -= 1;
      state.game.pacman.x = 1;
      state.game.pacman.y = 1;
      state.game.pacman.dx = 0;
      state.game.pacman.dy = 0;

      if (state.game.lives <= 0) {
        finishGame("Game Over!");
      }
    }
  });
}

function checkWin() {
  if (state.game.score === state.game.totalPellets) {
    finishGame("You win!");
  }
}

function renderGameFrame() {
  ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
  drawMap();
  drawPacman();
  drawGhosts();
  updateHUD();
  updateLeaderboard();
}

function gameLoop() {
  if (state.game.gameOver) {
    return;
  }

  movePacman();
  moveGhosts();
  checkCollision();
  checkWin();
  renderGameFrame();
}

function stopGameLoop() {
  if (state.intervals.loop) {
    clearInterval(state.intervals.loop);
    state.intervals.loop = null;
  }

  if (state.intervals.timer) {
    clearInterval(state.intervals.timer);
    state.intervals.timer = null;
  }
}

function startGameLoop() {
  stopGameLoop();
  renderGameFrame();

  state.intervals.loop = setInterval(gameLoop, state.game.speedMs);
  state.intervals.timer = setInterval(() => {
    if (state.game.gameOver) {
      return;
    }

    state.game.timeLeft -= 1;
    updateHUD();

    if (state.game.timeLeft <= 0) {
      finishGame(`Time's up! Score: ${state.game.score}`);
    }
  }, 1000);
}

function restartGame() {
  state.game = defaultGameState();
  closePopup();
  startGameLoop();
}

function startGame() {
  if (!state.intervals.loop && !state.intervals.timer) {
    restartGame();
  } else {
    renderGameFrame();
  }
}

function handleKeydown(event) {
  if (elements.screens.gameplay.classList.contains("hidden")) {
    return;
  }

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }

  if (event.key === "ArrowUp") state.game.pacman = { ...state.game.pacman, dx: 0, dy: -1 };
  if (event.key === "ArrowDown") state.game.pacman = { ...state.game.pacman, dx: 0, dy: 1 };
  if (event.key === "ArrowLeft") state.game.pacman = { ...state.game.pacman, dx: -1, dy: 0 };
  if (event.key === "ArrowRight") state.game.pacman = { ...state.game.pacman, dx: 1, dy: 0 };
}

function useSpeedBoost() {
  state.game.speedMs = 110;
  openPopup("speed");
  startGameLoop();
}

function useLivesBoost() {
  state.game.lives += 1;
  updateHUD();
  openPopup("lives");
}

elements.nicknameInput.addEventListener("input", handleNicknameInput);
elements.onboardingForm.addEventListener("submit", handleFormSubmit);
elements.resetProfileBtn.addEventListener("click", resetProfile);
elements.backToOnboardingBtn.addEventListener("click", goToOnboarding);
elements.clearProfileBtn.addEventListener("click", resetProfile);
elements.restartGameBtn.addEventListener("click", restartGame);
elements.speedBoostBtn.addEventListener("click", useSpeedBoost);
elements.livesBoostBtn.addEventListener("click", useLivesBoost);
elements.closePopupBtn.addEventListener("click", closePopup);
document.addEventListener("keydown", handleKeydown);

hydrateForm();
