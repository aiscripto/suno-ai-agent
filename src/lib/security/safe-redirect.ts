/**
 * Post-login redirect guard. Only same-site paths under an allowed prefix are
 * followed; anything else (absolute URLs, protocol-relative "//host",
 * backslash tricks, other areas of the app) falls back to the default.
 */
export function safeRedirect(from: string | null | undefined, allowedPrefix: string, fallback: string): string {
  if (!from) return fallback
  if (!from.startsWith('/') || from.startsWith('//') || from.includes('\\')) return fallback
  if (from !== allowedPrefix && !from.startsWith(`${allowedPrefix}/`) && !from.startsWith(`${allowedPrefix}?`)) return fallback
  return from
}
