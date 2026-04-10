export const HOBBY_ANNUAL_LIMIT = 30000;
export const HOBBY_WARNING_THRESH = 25000;
export function calcPct(t) { return Math.min((t/HOBBY_ANNUAL_LIMIT)*100, 100); }
export function isNearLimit(t) { return t >= HOBBY_WARNING_THRESH; }
export function isAtLimit(t) { return t >= HOBBY_ANNUAL_LIMIT; }
export function remainingAmount(t) { return Math.max(HOBBY_ANNUAL_LIMIT - t, 0); }
