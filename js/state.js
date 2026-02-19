const KEY = "vida-os6-state";

const baseState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  integrity: 100,
  focusMode: false,
  diet: { protein: 0, carb: 0, fat: 0, adherence: 100 },
  training: { sessionsWeek: 0, exercises: { pushup: 0, squat: 0, plank: 0 } },
  study: { completed: 0, abandoned: 0 },
  reading: { days: 0, progress: 0 },
  milestones: [],
};

export function loadState() {
  const cached = localStorage.getItem(KEY);
  if (!cached) return structuredClone(baseState);
  try {
    return { ...structuredClone(baseState), ...JSON.parse(cached) };
  } catch {
    return structuredClone(baseState);
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}
