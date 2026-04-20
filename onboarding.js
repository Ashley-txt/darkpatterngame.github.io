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
  selectedNamePreview: document.getElementById("selectedNamePreview")
};

function loadPlayer() {
  const fallback = {
    nickname: "",
    avatarId: avatarChoices[0].id
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);
    return {
      nickname: typeof parsed.nickname === "string" ? parsed.nickname : "",
      avatarId: avatarChoices.some((avatar) => avatar.id === parsed.avatarId)
        ? parsed.avatarId
        : fallback.avatarId
    };
  } catch (error) {
    return fallback;
  }
}

function savePlayer() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.player));
}

function renderAvatarOptions() {
  elements.avatarOptions.innerHTML = "";

  avatarChoices.forEach((avatar) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "avatar-option";
    button.dataset.avatarId = avatar.id;
    button.innerHTML = `
      <span class="avatar-option__emoji" aria-hidden="true">${avatar.emoji}</span>
      <span>
        <span class="avatar-option__name">${avatar.name}</span>
        <span class="avatar-option__hint">Profile icon</span>
      </span>
    `;

    button.addEventListener("click", () => {
      state.player.avatarId = avatar.id;
      updatePreview();
      renderSelectionState();
    });

    elements.avatarOptions.appendChild(button);
  });
}

function renderSelectionState() {
  elements.avatarOptions.querySelectorAll(".avatar-option").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.avatarId === state.player.avatarId);
  });
}

function updatePreview() {
  const avatar = avatarChoices.find((item) => item.id === state.player.avatarId) || avatarChoices[0];
  const displayName = state.player.nickname.trim() || "Player";
  elements.selectedAvatarPreview.textContent = avatar.emoji;
  elements.selectedNamePreview.textContent = displayName;
}

function hydrateForm() {
  elements.nicknameInput.value = state.player.nickname;
  renderAvatarOptions();
  renderSelectionState();
  updatePreview();
}

elements.nicknameInput.addEventListener("input", (event) => {
  state.player.nickname = event.target.value;
  updatePreview();
});

elements.onboardingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nickname = elements.nicknameInput.value.trim();

  if (!nickname) {
    elements.nicknameInput.focus();
    return;
  }

  state.player.nickname = nickname;
  savePlayer();
  window.location.href = "game.html";
});

hydrateForm();
