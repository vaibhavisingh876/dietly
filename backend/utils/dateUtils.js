// utils/dateUtils.js
//
// Centralized, timezone-aware "what day is it for this user" helper.
//
// The old code used `new Date().toISOString().split("T")[0]`, which always
// returns the UTC calendar date. For a user in India (UTC+5:30) logging a
// meal at 11:30 PM IST, that's already the next day in UTC — so their meal
// would silently get filed under tomorrow. This module fixes that by
// resolving "today" against an IANA timezone (sent by the frontend as the
// `X-Timezone` header) instead of the server's UTC clock.
//
// No new dependency is needed: Node ships with full ICU support, so the
// built-in Intl API already understands IANA timezone names.

export const DEFAULT_TIMEZONE = "Asia/Kolkata";

/**
 * Resolve the timezone to use for this request. Prefers the `X-Timezone`
 * header sent by the frontend (see frontend/src/api/api.js). Falls back to
 * DEFAULT_TIMEZONE if the header is missing or not a valid IANA zone.
 */
export function resolveTimezone(req) {
  const tz = req.headers["x-timezone"];
  if (typeof tz === "string" && tz.trim()) {
    try {
      // Throws RangeError for an invalid IANA zone name.
      // eslint-disable-next-line no-new
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
      return tz;
    } catch {
      // Invalid header value — fall through to the default.
    }
  }
  return DEFAULT_TIMEZONE;
}

/**
 * Returns the local calendar date (YYYY-MM-DD) for the given timezone.
 * This is the single source of truth for "today" used by Calories,
 * MealEntry, Meal history, Progress, and streak calculations, so they all
 * agree on the same logical day.
 */
export function getLocalDateString(timeZone = DEFAULT_TIMEZONE, date = new Date()) {
  // en-CA formats as YYYY-MM-DD, which is exactly what we want.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Shifts a YYYY-MM-DD date string by `days` (positive or negative) and
 * returns the resulting YYYY-MM-DD string. Pure calendar-day arithmetic —
 * does not need a timezone since it operates on the date string itself.
 */
export function shiftDateString(dateString, days) {
  const [y, m, d] = dateString.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().split("T")[0];
}