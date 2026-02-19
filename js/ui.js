import { xpToNext } from "./game.js";

const $ = (s) => document.querySelector(s);

export function bindTabs(onTab) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
      tab.classList.add("active");
      const pane = document.getElementById(tab.dataset.tab);
      pane.classList.add("active");
      onTab(tab.dataset.tab);
    });
  });
}

export function forceTab(name) {
  document.querySelector(`.tab[data-tab='${name}']`)?.click();
}

export function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1200);
}

export function render(state, mission, dailyProgress, rank) {
  $("#dailyProgressLabel").textContent = `${dailyProgress}%`;
  $("#dailyProgressBar").style.width = `${dailyProgress}%`;
  $("#xpLabel").textContent = state.xp;
  $("#levelLabel").textContent = state.level;
  $("#streakLabel").textContent = `${state.streak}🔥`;
  $("#integrityLabel").textContent = `Integridade ${Math.max(0, Math.round(state.integrity))}`;
  $("#missionTitle").textContent = mission.label;
  $("#rankLabel").textContent = rank;
  $("#xpProgressBar").style.width = `${Math.min(100, (state.xp / xpToNext(state.level)) * 100)}%`;

  $("#proteinBar").style.width = `${Math.min(100, state.diet.protein)}%`;
  $("#carbBar").style.width = `${Math.min(100, state.diet.carb)}%`;
  $("#fatBar").style.width = `${Math.min(100, state.diet.fat)}%`;
  $("#adherenceLabel").textContent = `Aderência alimentar: ${Math.round(state.diet.adherence)}%`;
  $("#adherenceLabel").style.color = state.diet.adherence < 70 ? "#ff9090" : "";

  $("#weeklyPerformance").textContent = `Performance semanal: ${state.training.sessionsWeek} sessões`;
  $("#readingBar").style.width = `${state.reading.progress}%`;
  $("#consistencyLabel").textContent = `Constância: ${state.reading.days} dias`;

  const list = $("#milestoneList");
  list.innerHTML = "";
  state.milestones.forEach((m) => {
    const li = document.createElement("li");
    li.textContent = m.text;
    if (m.done) li.classList.add("done");
    list.appendChild(li);
  });

  $("#focusToggle").textContent = `Modo Foco: ${state.focusMode ? "On" : "Off"}`;
  $("#focusToggle").setAttribute("aria-pressed", String(state.focusMode));
}

export function renderExercises(state, onDoneSet) {
  const entries = [
    { key: "pushup", name: "Push-up" },
    { key: "squat", name: "Squat" },
    { key: "plank", name: "Plank" },
  ];
  const parent = document.querySelector("#exerciseList");
  parent.innerHTML = "";
  entries.forEach((item) => {
    const card = document.createElement("div");
    card.className = "exercise-card";
    card.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <p>${state.training.exercises[item.key]} sets registrados</p>
      </div>
      <button class="btn primary" data-ex="${item.key}">+1 set</button>
    `;
    card.querySelector("button").addEventListener("click", () => onDoneSet(item.key));
    parent.appendChild(card);
  });
}

export function setupDietCards(onPick) {
  const options = [
    { id: "protein", title: "Proteína", points: 14 },
    { id: "carb", title: "Carbo", points: 12 },
    { id: "fat", title: "Gordura", points: 9 },
  ];
  const holder = document.getElementById("dietChoices");
  options.forEach((opt) => {
    const card = document.createElement("button");
    card.className = "choice-card btn";
    card.innerHTML = `<strong>${opt.title}</strong><p>+${opt.points}% macro</p>`;
    card.addEventListener("click", () => onPick(opt.id, opt.points));
    holder.appendChild(card);
  });
}

export function updateTimer(secondsLeft, totalSeconds) {
  const min = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const sec = (secondsLeft % 60).toString().padStart(2, "0");
  document.getElementById("timerLabel").textContent = `${min}:${sec}`;
  const circumference = 327;
  const ratio = 1 - secondsLeft / totalSeconds;
  document.getElementById("timerProgress").style.strokeDashoffset = `${circumference - circumference * ratio}`;
}
