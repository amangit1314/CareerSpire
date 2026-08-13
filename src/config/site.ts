/**
 * The app's own public URL. Was read as `process.env.NEXT_PUBLIC_APP_URL`
 * directly in 6 files with inconsistent handling — some had a localhost
 * fallback, some didn't, none stripped a trailing slash (the deployed value
 * has one: "https://careerspire.vercel.app/", which produced double slashes
 * wherever a path was appended, e.g. ".../reset-password" -> ".../\/auth/...").
 */
export const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
