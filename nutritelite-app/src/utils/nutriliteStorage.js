// src/utils/nutriliteStorage.js

const DAYS_KEY = "nutrilite_days_v1";     // saved history
const DRAFT_KEY = "nutrilite_draft_v1";   // in-progress (dashboard) for today

export function loadDays() {
  try {
    const raw = localStorage.getItem(DAYS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

export function saveDays(daysObj) {
  localStorage.setItem(DAYS_KEY, JSON.stringify(daysObj || {}));
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draftObj) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draftObj || null));
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

// LOCAL date key: YYYY-MM-DD (based on user's local timezone)
export function getLocalDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function makeEmptyLog() {
  return { Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
}

export function computeTotals(mealLog) {
  const all = [
    ...(mealLog?.Breakfast || []),
    ...(mealLog?.Lunch || []),
    ...(mealLog?.Dinner || []),
    ...(mealLog?.Snack || []),
  ];

  const sum = (k) => all.reduce((acc, x) => acc + (Number(x?.[k]) || 0), 0);

  const calories = Math.round(sum("kcal"));
  const protein = Math.round(sum("protein") * 10) / 10;
  const carbs = Math.round(sum("carbs") * 10) / 10;
  const fat = Math.round(sum("fat") * 10) / 10;

  return { calories, protein, carbs, fat };
}
// Calories burned estimate from steps (simple avg)
// 0.04 kcal per step ~ 400 kcal for 10,000 steps
export function estimateBurnedFromSteps(steps) {
  const s = Number(steps) || 0;
  return Math.round(s * 0.04);
}

// prefer stored burned else compute from stored steps
export function getBurnedForDay(dayObj) {
  const burned = Number(dayObj?.burned);
  if (burned && burned > 0) return burned;
  return estimateBurnedFromSteps(dayObj?.steps);
}
