// git commit: "feat(utils): add hobbyLimits helpers for income threshold calculations"

export const HOBBY_ANNUAL_LIMIT   = 30_000;
export const HOBBY_WARNING_THRESH = 25_000;
export const HOBBY_MONTHLY_JOBS   = 20;
export const PLATFORM_FEE         = 0.08;

/** Returns percentage of limit reached (0–100) */
export function calcPct(totalYear) {
  return Math.min((totalYear / HOBBY_ANNUAL_LIMIT) * 100, 100);
}

/** True when within warning band (>= 25 000) */
export function isNearLimit(totalYear) {
  return totalYear >= HOBBY_WARNING_THRESH;
}

/** True when limit fully reached (>= 30 000) */
export function isAtLimit(totalYear) {
  return totalYear >= HOBBY_ANNUAL_LIMIT;
}

/** Remaining amount before limit */
export function remainingAmount(totalYear) {
  return Math.max(HOBBY_ANNUAL_LIMIT - totalYear, 0);
}
