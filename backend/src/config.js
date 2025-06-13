// Central configuration helper
// Reads environment variables and provides sane defaults.
// Extend this file with more config values as needed.

export const SIGNED_URL_TTL = parseInt(process.env.SIGNED_URL_TTL, 10) || 600; // 10 minutes
