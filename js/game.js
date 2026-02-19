const RANKS = ["Recruta", "Soldado", "Elite", "Comandante", "General"];

export function getMissionByTime(now = new Date()) {
  const hour = now.getHours();
  if (hour < 10) return { module: "diet", label: "Preparar alimentação estratégica" };
  if (hour < 15) return { module: "training", label: "Executar treino principal" };
  if (hour < 20) return { module: "study", label: "Sessão de foco profundo" };
  return { module: "reading", label: "Leitura e fechamento do dia" };
}

export function xpToNext(level) {
  return 120 + (level - 1) * 55;
}

export function addXP(state, amount) {
  state.xp += amount;
  let needed = xpToNext(state.level);
  let leveled = false;
  while (state.xp >= needed) {
    state.xp -= needed;
    state.level += 1;
    needed = xpToNext(state.level);
    leveled = true;
  }
  return leveled;
}

export function getRank(level) {
  const idx = Math.min(RANKS.length - 1, Math.floor((level - 1) / 3));
  return RANKS[idx];
}

export function calcDailyProgress(state) {
  const modules = [
    state.diet.protein > 0 || state.diet.carb > 0 || state.diet.fat > 0,
    state.training.sessionsWeek > 0,
    state.study.completed > 0,
    state.reading.progress > 0,
  ];
  return Math.round((modules.filter(Boolean).length / modules.length) * 100);
}

export function evaluateMilestones(state) {
  const checks = [
    { id: "lvl3", text: "Alcançar nível 3", done: state.level >= 3 },
    { id: "streak5", text: "Manter streak de 5 dias", done: state.streak >= 5 },
    { id: "integrity90", text: "Integridade acima de 90", done: state.integrity >= 90 },
    { id: "reader", text: "Registrar 7 leituras", done: state.reading.days >= 7 },
  ];
  state.milestones = checks;
}
