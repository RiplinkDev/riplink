// Minimal helpers (no signing). Good for internal testing.
// For production later, we’ll reintroduce a signed cookie.

export const COOKIE_NAME = 'dashboard';

// Cookie Max-Age in seconds; set to 0 to make it session-only.
export const COOKIE_TTL_SEC = Number(process.env.DASHBOARD_SESSION_TTL_SEC || 0);
