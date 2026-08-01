/**
 * Normalizes user-entered URLs for links.
 * Bare domains get https://, emails become mailto:, known schemes pass through.
 */
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^(https?:|mailto:|tel:|#)/i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.includes('@') && !trimmed.includes('/')) {
    return `mailto:${trimmed}`;
  }
  return `https://${trimmed}`;
}
