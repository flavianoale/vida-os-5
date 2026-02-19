let context;

function getCtx() {
  if (!context) context = new AudioContext();
  return context;
}

export function playFeedback(kind = "ok") {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = kind === "warn" ? 180 : 420;
  gain.gain.value = 0.0001;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.13);
  osc.stop(ctx.currentTime + 0.14);
}

export function haptic(ms = 18) {
  if (navigator.vibrate) navigator.vibrate(ms);
}
