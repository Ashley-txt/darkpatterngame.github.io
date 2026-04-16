const STORAGE_KEY = "points-challenge-player";

const avatarChoices = [
  { id: "spark", emoji: "⚡", name: "Spark" },
  { id: "orbit", emoji: "🪐", name: "Orbit" },
  { id: "pixel", emoji: "🟧", name: "Pixel" },
  { id: "nova", emoji: "🌟", name: "Nova" },
  { id: "pulse", emoji: "💠", name: "Pulse" },
  { id: "echo", emoji: "🔷", name: "Echo" }
];

const state = {
  player: loadPlayer()
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
  playerBadge: document.getElementById("playerBadge"),
  playerAvatarBadge: document.getElementById("playerAvatarBadge"),
  playerNameBadge: document.getElementById("playerNameBadge"),
  screens: {
    onboarding: document.getElementById("screen-onboarding"),
    gameplay: document.getElementById("screen-gameplay"),
    outcome: document.getElementById("screen-outcome")
  }
};

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

function avatarExists(avatarId) {
  return avatarChoices.some((avatar) => avatar.id === avatarId);
}

function getAvatarById(avatarId) {
  return avatarChoices.find((avatar) => avatar.id === avatarId) || avatarChoices[0];
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
  } else {
    showScreen("onboarding");
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
}

function goToOnboarding() {
  updateSelectedProfilePreview();
  renderAvatarSelectionState();
  showScreen("onboarding");
  elements.nicknameInput.focus();
}

function resetProfile() {
  localStorage.removeItem(STORAGE_KEY);
  state.player = {
    nickname: "",
    avatarId: avatarChoices[0].id
  };

  hydrateForm();
  elements.nicknameInput.focus();
}

elements.nicknameInput.addEventListener("input", handleNicknameInput);
elements.onboardingForm.addEventListener("submit", handleFormSubmit);
elements.resetProfileBtn.addEventListener("click", resetProfile);
elements.backToOnboardingBtn.addEventListener("click", goToOnboarding);
elements.clearProfileBtn.addEventListener("click", resetProfile);

hydrateForm();
