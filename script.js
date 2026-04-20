const PLAYER_STORAGE_KEY = "points-challenge-player";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const tileSize = 22;

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

const LEVEL_CONFIG = [
  { ghosts: [{ x: 17, y: 1 }, { x: 17, y: 13 }], ghostInterval: 420, timeLimit: 60, label: "Level 1", successRate: "88%" },
  { ghosts: [{ x: 17, y: 1 }, { x: 17, y: 13 }, { x: 1, y: 13 }], ghostInterval: 360, timeLimit: 55, label: "Level 2", successRate: "66%" },
  { ghosts: [{ x: 17, y: 1 }, { x: 17, y: 13 }, { x: 1, y: 13 }, { x: 9, y: 7 }], ghostInterval: 300, timeLimit: 50, label: "Level 3", successRate: "43%" },
  { ghosts: [{ x: 17, y: 1 }, { x: 17, y: 13 }, { x: 1, y: 13 }, { x: 9, y: 7 }], ghostInterval: 220, timeLimit: 45, label: "Level 4", successRate: "21%" }
];

const ROUND_PROMPTS = [
  [
    {
      boost: "speed",
      buttonId: "speedBoostBtn",
      title: "Players who activated Speed Boost cleared Level 1 93% of the time",
      message: "Fast starters usually finish before the ghosts get organized.",
      meta: "Most top scorers take speed first on easy rounds.",
      acceptLabel: "Buy Speed Boost"
    },
    {
      boost: "lives",
      buttonId: "livesBoostBtn",
      title: "Only 12% of Level 1 failures bought extra lives before starting",
      message: "Safer players usually protect the round before the first mistake.",
      meta: "Adding lives now lowers the risk of an early restart.",
      acceptLabel: "Buy Extra Lives"
    },
    {
      boost: "time",
      buttonId: "timeBoostBtn",
      title: "Players who banked more time on Level 1 kept their streaks 81% longer",
      message: "A little extra time keeps the pace comfortable.",
      meta: "Timer protection is popular with repeat winners.",
      acceptLabel: "Buy More Time"
    }
  ],
  [
    {
      boost: "speed",
      buttonId: "speedBoostBtn",
      title: "Level 2 clears were 89% more common after activating Speed Boost",
      message: "This round punishes slow openings much faster.",
      meta: "Competitive players usually speed up here.",
      acceptLabel: "Buy Speed Boost"
    },
    {
      boost: "lives",
      buttonId: "livesBoostBtn",
      title: "67% of Level 2 survivors entered with backup lives",
      message: "One bad turn is much more expensive now.",
      meta: "Extra lives are the most common insurance on this level.",
      acceptLabel: "Buy Extra Lives"
    },
    {
      boost: "time",
      buttonId: "timeBoostBtn",
      title: "Level 2 players with extra time reached the last corridor 74% more often",
      message: "The maze gets tighter, and time disappears faster.",
      meta: "More time is one of the safest purchases this round.",
      acceptLabel: "Buy More Time"
    }
  ],
  [
    {
      boost: "speed",
      buttonId: "speedBoostBtn",
      title: "Top Level 3 runs almost always begin with Speed Boost",
      message: "Players who hesitate here usually lose control of the board.",
      meta: "Speed is the most copied purchase on this round.",
      acceptLabel: "Buy Speed Boost"
    },
    {
      boost: "lives",
      buttonId: "livesBoostBtn",
      title: "Level 3 winners were 3x more likely to carry extra lives",
      message: "Ghost pressure ramps up quickly after the opening.",
      meta: "The safest runs buy recovery before they need it.",
      acceptLabel: "Buy Extra Lives"
    },
    {
      boost: "time",
      buttonId: "timeBoostBtn",
      title: "Only 18% of failed Level 3 runs started with More Time",
      message: "Most players who skip time support run out before the last pellets.",
      meta: "Extending the timer helps stabilize difficult routes.",
      acceptLabel: "Buy More Time"
    }
  ],
  [
    {
      boost: "speed",
      buttonId: "speedBoostBtn",
      title: "Nearly every Level 4 clear started with Speed Boost",
      message: "This round is tuned to punish anyone who opens slowly.",
      meta: "The best players treat speed as mandatory here.",
      acceptLabel: "Buy Speed Boost"
    },
    {
      boost: "lives",
      buttonId: "livesBoostBtn",
      title: "Level 4 survivors almost never begin without extra lives",
      message: "One collision usually decides the whole run at this point.",
      meta: "Backup lives are the most common safety purchase on the final round.",
      acceptLabel: "Buy Extra Lives"
    },
    {
      boost: "time",
      buttonId: "timeBoostBtn",
      title: "Final-round players who purchased More Time lasted 82% longer",
      message: "The clock is the real threat on Level 4.",
      meta: "Time support keeps last-minute collapses from ending the run.",
      acceptLabel: "Buy More Time"
    }
  ]
];

const RUNTIME_PROMPTS = {
  speed: {
    boost: "speed",
    buttonId: "speedBoostBtn",
    title: "You're going too slow!",
    message: "Get a speed boost before it's too late!",
    meta: "Top players usually accelerate around this point in the round.",
    acceptLabel: "Buy Speed Boost"
  },
  lives: {
    boost: "lives",
    buttonId: "livesBoostBtn",
    title: "Only 1 life left",
    message: "Don't let one mistake erase this round.",
    meta: "Most surviving players add lives before the next collision.",
    acceptLabel: "Buy Extra Lives"
  },
  time: {
    boost: "time",
    buttonId: "timeBoostBtn",
    title: "Time's almost up",
    message: "Only 30 seconds left. Buy more time before this round slips away.",
    meta: "Most players who survive the late timer add time right here.",
    acceptLabel: "Buy More Time"
  }
};

const elements = {
  score: document.getElementById("score"),
  lives: document.getElementById("lives"),
  timer: document.getElementById("timer"),
  levelLabel: document.getElementById("levelLabel"),
  scoresList: document.getElementById("scoresList"),
  popup: document.getElementById("popup"),
  popupTitle: document.getElementById("popupTitle"),
  popupText: document.getElementById("popupText"),
  closePopupBtn: document.getElementById("closePopupBtn"),
  promptBackdrop: document.getElementById("promptBackdrop"),
  boostPrompt: document.getElementById("boostPrompt"),
  promptTitle: document.getElementById("promptTitle"),
  promptMessage: document.getElementById("promptMessage"),
  promptMeta: document.getElementById("promptMeta"),
  acceptPromptBtn: document.getElementById("acceptPromptBtn"),
  dismissPromptBtn: document.getElementById("dismissPromptBtn"),
  levelIntroPopup: document.getElementById("levelIntroPopup"),
  levelIntroTitle: document.getElementById("levelIntroTitle"),
  levelIntroFact: document.getElementById("levelIntroFact"),
  closeLevelIntroBtn: document.getElementById("closeLevelIntroBtn"),
  gameOverScreen: document.getElementById("gameOverScreen"),
  roundSummaryScreen: document.getElementById("roundSummaryScreen"),
  roundTimeStat: document.getElementById("roundTimeStat"),
  roundScoreStat: document.getElementById("roundScoreStat"),
  roundLivesLostStat: document.getElementById("roundLivesLostStat"),
  roundRankingMessage: document.getElementById("roundRankingMessage"),
  finalMessage: document.getElementById("finalMessage"),
  pelletsCollectedStat: document.getElementById("pelletsCollectedStat"),
  pelletsRemainingStat: document.getElementById("pelletsRemainingStat"),
  pressureMessage: document.getElementById("pressureMessage"),
  restartBtn: document.getElementById("restartBtn"),
  purchaseComboBtn: document.getElementById("purchaseComboBtn"),
  nextRoundBtn: document.getElementById("nextRoundBtn"),
  speedBoostBtn: document.getElementById("speedBoostBtn"),
  livesBoostBtn: document.getElementById("livesBoostBtn"),
  timeBoostBtn: document.getElementById("timeBoostBtn"),
  menuBackBtn: document.getElementById("menuBackBtn"),
  startRunBtn: document.getElementById("startRunBtn")
};

function freshMap() {
  return MAP_TEMPLATE.map((row) => [...row]);
}

function loadStoredPlayer() {
  try {
    return JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

const player = loadStoredPlayer();
const playerLabel = player.nickname ? `${player.nickname.toUpperCase()}:` : "LAST PLACE YOU:";

let map = freshMap();
canvas.width = map[0].length * tileSize;
canvas.height = map.length * tileSize;

let gameState = "ready";
let score = 0;
let lives = 3;
let timeLeft = LEVEL_CONFIG[0].timeLimit;
let currentLevel = 0;
let ghosts = [];
let pacman = { x: 1, y: 1, dx: 0, dy: 0 };
let totalPellets = 0;
let pelletsEatenThisLevel = 0;
let ghostMoveInterval = null;
let popupHideTimeout = null;
let activePromptIndex = -1;
let activeRuntimePrompt = null;
let speedBoostActive = false;
let levelIntroOpen = false;
let runtimePromptShown = { speed: false, lives: false, time: false };
let pendingNextLevel = null;
let roundStartScore = 0;
let roundStartLives = 3;
let roundStartTime = LEVEL_CONFIG[0].timeLimit;

const leaderboard = [
  { name: "Alex", score: 120 },
  { name: "Jordan", score: 95 },
  { name: "Sam", score: 80 },
  { name: playerLabel, score: 0 }
];

function countPellets() {
  totalPellets = 0;
  map.forEach((row) => row.forEach((cell) => {
    if (cell === 0) totalPellets += 1;
  }));
}

function openPopup(title, message, autoHideMs = 0) {
  elements.popupTitle.textContent = title;
  elements.popupText.textContent = message;
  elements.popup.classList.remove("hidden");

  if (popupHideTimeout) {
    clearTimeout(popupHideTimeout);
    popupHideTimeout = null;
  }

  if (autoHideMs > 0) {
    popupHideTimeout = setTimeout(() => {
      closePopup();
      popupHideTimeout = null;
    }, autoHideMs);
  }
}

function closePopup() {
  elements.popup.classList.add("hidden");
}

function updateHUD() {
  elements.score.textContent = score;
  elements.lives.textContent = lives;
  elements.levelLabel.textContent = LEVEL_CONFIG[currentLevel].label;
  elements.timer.textContent = gameState === "ready"
    ? currentLevel === 0
      ? "1 minute"
      : `${LEVEL_CONFIG[currentLevel].timeLimit} seconds`
    : `${timeLeft} seconds`;

  elements.timer.style.color = "white";
  if (gameState === "playing" && timeLeft <= 30) elements.timer.style.color = "orange";
  if (gameState === "playing" && timeLeft <= 10) elements.timer.style.color = "red";
}

function updateLeaderboard() {
  leaderboard.forEach((entry) => {
    if (entry.name === playerLabel) {
      entry.score = score;
    } else {
      entry.score += Math.floor(Math.random() * 3);
    }
  });

  leaderboard.sort((a, b) => b.score - a.score);
  elements.scoresList.innerHTML = "";
  const rankSymbols = ["①", "②", "③", "④"];

  leaderboard.forEach((entry, index) => {
    const li = document.createElement("li");
    li.setAttribute("data-rank", rankSymbols[index] || `${index + 1}.`);
    if (entry.name === playerLabel) li.classList.add("you-row");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = entry.name;
    nameSpan.style.flex = "1";
    nameSpan.style.textAlign = "left";
    nameSpan.style.marginRight = "6px";

    const scoreSpan = document.createElement("span");
    scoreSpan.textContent = String(entry.score).padStart(4, "0");

    li.appendChild(nameSpan);
    li.appendChild(scoreSpan);
    elements.scoresList.appendChild(li);
  });
}

function drawMap() {
  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
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
  ghosts.forEach((ghost) => {
    ctx.fillRect(ghost.x * tileSize + 4, ghost.y * tileSize + 4, 14, 14);
  });
}

function renderFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPacman();
  drawGhosts();
  updateHUD();
  updateLeaderboard();
}

function bfsNextStep(ghost, target) {
  const queue = [{ x: ghost.x, y: ghost.y, path: [] }];
  const visited = new Set([`${ghost.x},${ghost.y}`]);

  while (queue.length > 0) {
    const current = queue.shift();
    const directions = [
      { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];

    for (const direction of directions) {
      const nx = current.x + direction.dx;
      const ny = current.y + direction.dy;
      const key = `${nx},${ny}`;

      if (map[ny]?.[nx] === undefined) continue;
      if (map[ny][nx] === 1) continue;
      if (visited.has(key)) continue;

      const newPath = [...current.path, { x: nx, y: ny }];
      if (nx === target.x && ny === target.y) {
        return newPath[0] || { x: ghost.x, y: ghost.y };
      }

      visited.add(key);
      queue.push({ x: nx, y: ny, path: newPath });
    }
  }

  return { x: ghost.x, y: ghost.y };
}

function restartGhostInterval() {
  if (ghostMoveInterval) clearInterval(ghostMoveInterval);
  const baseInterval = LEVEL_CONFIG[currentLevel].ghostInterval;
  const effectiveInterval = speedBoostActive ? Math.max(140, baseInterval - 120) : baseInterval;
  ghostMoveInterval = setInterval(() => {
    if (gameState === "playing") moveGhosts();
  }, effectiveInterval);
}

function moveGhosts() {
  ghosts.forEach((ghost) => {
    const chaseChance = currentLevel === 3 ? 1.0
      : currentLevel === 2 ? 0.8
      : currentLevel === 1 ? 0.6
      : 0.4;

    if (Math.random() < chaseChance) {
      const next = bfsNextStep(ghost, pacman);
      ghost.x = next.x;
      ghost.y = next.y;
      return;
    }

    const directions = [
      { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
      { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const nx = ghost.x + direction.dx;
    const ny = ghost.y + direction.dy;
    if (map[ny][nx] !== 1) {
      ghost.x = nx;
      ghost.y = ny;
    }
  });
}

function applyBoost(type) {
  if (type === "speed") {
    speedBoostActive = true;
    if (gameState === "playing") restartGhostInterval();
    openPopup("⚡ Speed Boost", "You took the speed boost. Faster openings usually produce higher scores.", 2200);
  }

  if (type === "lives") {
    lives += 3;
    updateHUD();
    openPopup("❤️ Extra Lives", "You added 3 lives. Safer runs usually last longer.", 2200);
  }

  if (type === "time") {
    timeLeft += 15;
    updateHUD();
    openPopup("⏱ More Time", "You added 15 seconds. More time keeps the round from collapsing late.", 2200);
  }
}

function positionPromptForButton(button) {
  const rect = button.getBoundingClientRect();
  elements.boostPrompt.style.top = `${rect.top + window.scrollY - 8}px`;
  elements.boostPrompt.style.left = `${rect.right + window.scrollX + 18}px`;
}

function clearBoostHighlights() {
  elements.speedBoostBtn.classList.remove("boost-highlight");
  elements.livesBoostBtn.classList.remove("boost-highlight");
  elements.timeBoostBtn.classList.remove("boost-highlight");
}

function hideBoostPrompt() {
  elements.boostPrompt.classList.add("hidden");
  elements.promptBackdrop.classList.add("hidden");
  clearBoostHighlights();
  activePromptIndex = -1;
  activeRuntimePrompt = null;
}

function showRoundPrompt(index) {
  const prompt = ROUND_PROMPTS[currentLevel][index];

  if (!prompt) {
    hideBoostPrompt();
    elements.startRunBtn.disabled = false;
    elements.startRunBtn.textContent = `▶ Start ${LEVEL_CONFIG[currentLevel].label}`;
    activePromptIndex = -1;
    return;
  }

  activePromptIndex = index;
  const button = document.getElementById(prompt.buttonId);
  clearBoostHighlights();
  button.classList.add("boost-highlight");
  elements.promptTitle.textContent = prompt.title;
  elements.promptMessage.textContent = prompt.message;
  elements.promptMeta.textContent = prompt.meta;
  elements.acceptPromptBtn.textContent = prompt.acceptLabel;
  positionPromptForButton(button);
  elements.promptBackdrop.classList.remove("hidden");
  elements.boostPrompt.classList.remove("hidden");
}

function showRuntimePrompt(promptKey) {
  const prompt = RUNTIME_PROMPTS[promptKey];
  if (!prompt || gameState !== "playing" || activeRuntimePrompt || activePromptIndex !== -1) return;

  activeRuntimePrompt = promptKey;
  gameState = "prompt";

  const button = document.getElementById(prompt.buttonId);
  clearBoostHighlights();
  button.classList.add("boost-highlight");
  elements.promptTitle.textContent = prompt.title;
  elements.promptMessage.textContent = prompt.message;
  elements.promptMeta.textContent = prompt.meta;
  elements.acceptPromptBtn.textContent = prompt.acceptLabel;
  positionPromptForButton(button);
  elements.promptBackdrop.classList.remove("hidden");
  elements.boostPrompt.classList.remove("hidden");
}

function closeLevelIntro() {
  levelIntroOpen = false;
  elements.levelIntroPopup.classList.add("hidden");
  showRoundPrompt(0);
}

function showLevelIntro() {
  const level = LEVEL_CONFIG[currentLevel];
  levelIntroOpen = true;
  elements.levelIntroTitle.textContent = level.label;
  elements.levelIntroFact.textContent = `${level.successRate} of players successfully clear this level.`;
  elements.levelIntroPopup.classList.remove("hidden");
}

function prepareLevel(levelIndex) {
  currentLevel = levelIndex;
  map = freshMap();
  countPellets();
  pacman = { x: 1, y: 1, dx: 0, dy: 0 };
  ghosts = LEVEL_CONFIG[currentLevel].ghosts.map((ghost) => ({ ...ghost }));
  timeLeft = LEVEL_CONFIG[currentLevel].timeLimit;
  pelletsEatenThisLevel = 0;
  speedBoostActive = false;
  runtimePromptShown = { speed: false, lives: false, time: false };
  gameState = "ready";
  activePromptIndex = -1;
  activeRuntimePrompt = null;

  if (ghostMoveInterval) {
    clearInterval(ghostMoveInterval);
    ghostMoveInterval = null;
  }

  hideBoostPrompt();
  elements.gameOverScreen.classList.add("hidden");
  elements.roundSummaryScreen.classList.add("hidden");
  elements.startRunBtn.disabled = true;
  elements.startRunBtn.textContent = "Review Round Setup";
  renderFrame();
  showLevelIntro();
}

function startLevel() {
  if (gameState !== "ready" || activePromptIndex !== -1 || levelIntroOpen) return;
  gameState = "playing";
  roundStartScore = score;
  roundStartLives = lives;
  roundStartTime = LEVEL_CONFIG[currentLevel].timeLimit;
  elements.startRunBtn.disabled = true;
  elements.startRunBtn.textContent = "▶ Running";
  updateHUD();
  restartGhostInterval();
}

function movePacman() {
  const nx = pacman.x + pacman.dx;
  const ny = pacman.y + pacman.dy;

  if (map[ny]?.[nx] !== 1) {
    pacman.x = nx;
    pacman.y = ny;
    if (map[ny][nx] === 0) {
      score += 1;
      pelletsEatenThisLevel += 1;
      map[ny][nx] = 2;
    }
  }
}

function showGameOver(reasonText) {
  gameState = "gameover";
  hideBoostPrompt();
  elements.levelIntroPopup.classList.add("hidden");
  elements.roundSummaryScreen.classList.add("hidden");
  elements.startRunBtn.disabled = true;
  elements.startRunBtn.textContent = "▶ Start Level";

  if (ghostMoveInterval) {
    clearInterval(ghostMoveInterval);
    ghostMoveInterval = null;
  }

  const pelletsRemaining = totalPellets - pelletsEatenThisLevel;
  elements.finalMessage.textContent = reasonText;
  elements.pelletsCollectedStat.textContent = pelletsEatenThisLevel;
  elements.pelletsRemainingStat.textContent = pelletsRemaining;
  elements.pressureMessage.textContent = `You only have ${pelletsRemaining} pellets left for this round! Don't restart!`;
  elements.gameOverScreen.classList.remove("hidden");
}

function getRoundRankingMessage(timeTaken) {
  if (timeTaken <= 18) {
    return "You ranked with the top 15% of players in time to complete. Next round, most leaders still buy speed boost.";
  }

  if (timeTaken <= 30) {
    return "You ranked around the middle 40% of players in time to complete. Speed boost could move you up next round.";
  }

  return "You ranked amongst the bottom 10% of players in time to complete. Next round, get a speed boost!";
}

function showRoundSummary(nextLevelIndex) {
  gameState = "summary";
  pendingNextLevel = nextLevelIndex;
  hideBoostPrompt();
  elements.levelIntroPopup.classList.add("hidden");
  elements.startRunBtn.disabled = true;
  elements.startRunBtn.textContent = "▶ Start Level";

  if (ghostMoveInterval) {
    clearInterval(ghostMoveInterval);
    ghostMoveInterval = null;
  }

  const timeTaken = roundStartTime - timeLeft;
  const scoreEarned = score - roundStartScore;
  const livesLost = roundStartLives - lives;

  elements.roundTimeStat.textContent = `${Math.max(0, timeTaken)}s`;
  elements.roundScoreStat.textContent = scoreEarned;
  elements.roundLivesLostStat.textContent = Math.max(0, livesLost);
  elements.roundRankingMessage.textContent = getRoundRankingMessage(timeTaken);
  elements.roundSummaryScreen.classList.remove("hidden");
}

function checkCollision() {
  ghosts.forEach((ghost) => {
    if (ghost.x === pacman.x && ghost.y === pacman.y) {
      lives -= 1;
      pacman = { x: 1, y: 1, dx: 0, dy: 0 };
      updateHUD();
      if (lives <= 0) {
        showGameOver("You were caught before finishing the round.");
      } else if (lives === 1 && !runtimePromptShown.lives) {
        runtimePromptShown.lives = true;
        showRuntimePrompt("lives");
      }
    }
  });
}

function checkWin() {
  if (pelletsEatenThisLevel < totalPellets) return;

  if (currentLevel < LEVEL_CONFIG.length - 1) {
    showRoundSummary(currentLevel + 1);
    return;
  }

  showGameOver("🏆 You beat all 4 levels.");
}

function gameLoop() {
  if (gameState !== "playing") return;
  movePacman();
  checkCollision();
  checkWin();
  renderFrame();
}

function restartRun() {
  score = 0;
  lives = 3;
  prepareLevel(0);
}

function purchaseCombo() {
  lives = 3;
  speedBoostActive = true;
  elements.gameOverScreen.classList.add("hidden");
  prepareLevel(currentLevel);
}

elements.closePopupBtn.addEventListener("click", closePopup);
elements.closeLevelIntroBtn.addEventListener("click", closeLevelIntro);
elements.dismissPromptBtn.addEventListener("click", () => {
  if (activeRuntimePrompt) {
    hideBoostPrompt();
    gameState = "playing";
    return;
  }

  if (activePromptIndex === -1) return;
  showRoundPrompt(activePromptIndex + 1);
});
elements.acceptPromptBtn.addEventListener("click", () => {
  if (activeRuntimePrompt) {
    const prompt = RUNTIME_PROMPTS[activeRuntimePrompt];
    applyBoost(prompt.boost);
    hideBoostPrompt();
    gameState = "playing";
    return;
  }

  if (activePromptIndex === -1) return;
  const prompt = ROUND_PROMPTS[currentLevel][activePromptIndex];
  applyBoost(prompt.boost);
  showRoundPrompt(activePromptIndex + 1);
});
elements.restartBtn.addEventListener("click", restartRun);
elements.purchaseComboBtn.addEventListener("click", purchaseCombo);
elements.nextRoundBtn.addEventListener("click", () => {
  if (pendingNextLevel !== null) {
    prepareLevel(pendingNextLevel);
    pendingNextLevel = null;
  }
});
elements.speedBoostBtn.addEventListener("click", () => applyBoost("speed"));
elements.livesBoostBtn.addEventListener("click", () => applyBoost("lives"));
elements.timeBoostBtn.addEventListener("click", () => applyBoost("time"));
elements.menuBackBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});
elements.startRunBtn.addEventListener("click", startLevel);

window.addEventListener("resize", () => {
  if (activeRuntimePrompt) {
    const prompt = RUNTIME_PROMPTS[activeRuntimePrompt];
    positionPromptForButton(document.getElementById(prompt.buttonId));
  } else if (activePromptIndex >= 0) {
    const prompt = ROUND_PROMPTS[currentLevel][activePromptIndex];
    positionPromptForButton(document.getElementById(prompt.buttonId));
  }
});

document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }

  if (gameState !== "playing") return;
  if (event.key === "ArrowUp") pacman = { ...pacman, dx: 0, dy: -1 };
  if (event.key === "ArrowDown") pacman = { ...pacman, dx: 0, dy: 1 };
  if (event.key === "ArrowLeft") pacman = { ...pacman, dx: -1, dy: 0 };
  if (event.key === "ArrowRight") pacman = { ...pacman, dx: 1, dy: 0 };
});

setInterval(gameLoop, 160);
setInterval(() => {
  if (gameState === "playing") {
    timeLeft -= 1;
    updateHUD();
    if (timeLeft <= 30 && !runtimePromptShown.time) {
      runtimePromptShown.time = true;
      showRuntimePrompt("time");
    }
    if (timeLeft <= 45 && !runtimePromptShown.speed) {
      runtimePromptShown.speed = true;
      showRuntimePrompt("speed");
    }
    if (timeLeft <= 0) {
      showGameOver("Time ran out before you cleared the pellets.");
    }
  }
}, 1000);

prepareLevel(0);
