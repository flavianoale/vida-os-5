import { loadState, saveState, getTodayKey } from "./state.js";
import { addXP, calcDailyProgress, evaluateMilestones, getMissionByTime, getRank } from "./game.js";
import { bindTabs, forceTab, render, renderExercises, setupDietCards, showToast, updateTimer } from "./ui.js";
import { haptic, playFeedback } from "./audio.js";

const state = loadState();
const portionRange = document.getElementById("portionRange");
const portionValue = document.getElementById("portionValue");
let timerId;
let focusSeconds = 25 * 60;
const totalFocusSeconds = focusSeconds;

function refresh() {
  const mission = getMissionByTime();
  evaluateMilestones(state);
  render(state, mission, calcDailyProgress(state), getRank(state.level));
  renderExercises(state, onSetDone);
  saveState(state);
}

function reward(message, xp = 20, negative = false) {
  if (!negative) {
    const leveled = addXP(state, xp);
    if (leveled) showToast("LEVEL UP! Reforço máximo ⚡");
    playFeedback("ok");
    haptic(20);
  } else {
    state.integrity -= 7;
    playFeedback("warn");
    haptic(10);
  }
  showToast(message);
  refresh();
}

function checkStreak() {
  const today = getTodayKey();
  if (!state.lastActiveDate) {
    state.streak = 1;
  } else {
    const delta = (new Date(today) - new Date(state.lastActiveDate)) / 86400000;
    if (delta === 1) state.streak += 1;
    if (delta > 1) {
      state.streak = 0;
      state.integrity -= 8;
      showToast("Streak quebrado. Bônus reduzido.");
    }
  }
  state.lastActiveDate = today;
}

function onSetDone(exKey) {
  state.training.exercises[exKey] += 1;
  state.training.sessionsWeek = Object.values(state.training.exercises).reduce((a, b) => a + b, 0) > 0
    ? Math.ceil(Object.values(state.training.exercises).reduce((a, b) => a + b, 0) / 3)
    : 0;
  reward("Set confirmado. Força crescente.", 18);
}

setupDietCards((macro, points) => {
  const multiplier = Number(portionRange.value);
  state.diet[macro] = Math.min(100, state.diet[macro] + points * multiplier);
  const avg = (state.diet.protein + state.diet.carb + state.diet.fat) / 3;
  state.diet.adherence = 100 - Math.abs(100 - avg);
  if (state.diet[macro] > 100) reward("Limite ultrapassado. Ajuste estratégico.", 0, true);
  else reward("Macro registrado com precisão.", 12);
});

portionRange.addEventListener("input", () => {
  portionValue.textContent = `${Number(portionRange.value).toFixed(1)}x`;
});

document.getElementById("startStudy").addEventListener("click", () => {
  if (timerId) return;
  timerId = setInterval(() => {
    focusSeconds -= 1;
    updateTimer(focusSeconds, totalFocusSeconds);
    if (focusSeconds <= 0) {
      clearInterval(timerId);
      timerId = null;
      focusSeconds = totalFocusSeconds;
      state.study.completed += 1;
      reward("Sessão finalizada. Vitória cognitiva.", 30);
      updateTimer(focusSeconds, totalFocusSeconds);
    }
  }, 1000);
  reward("Foco iniciado.", 5);
});

document.getElementById("abandonStudy").addEventListener("click", () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  focusSeconds = totalFocusSeconds;
  state.study.abandoned += 1;
  state.integrity -= 5;
  reward("Sessão abandonada. Controle retomado exigido.", 0, true);
  updateTimer(focusSeconds, totalFocusSeconds);
});

document.getElementById("logReading").addEventListener("click", () => {
  state.reading.days += 1;
  state.reading.progress = Math.min(100, state.reading.progress + 3);
  reward("Leitura registrada. Constância reforçada.", 16);
});

document.getElementById("focusToggle").addEventListener("click", () => {
  state.focusMode = !state.focusMode;
  reward(state.focusMode ? "Modo foco ativado." : "Modo foco desativado.", 0);
  if (state.focusMode) forceTab(getMissionByTime().module);
});

document.getElementById("continueBtn").addEventListener("click", () => {
  const mission = getMissionByTime();
  forceTab(mission.module);
  reward("Rota ideal selecionada.", 8);
});

bindTabs((active) => {
  if (state.focusMode) {
    const required = getMissionByTime().module;
    if (active !== required) {
      showToast(`Modo foco: siga ${required.toUpperCase()}`);
      forceTab(required);
    }
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}

checkStreak();
updateTimer(focusSeconds, totalFocusSeconds);
forceTab(getMissionByTime().module);
refresh();
