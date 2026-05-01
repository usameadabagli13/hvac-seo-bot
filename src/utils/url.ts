export class InvalidUrlError extends Error {
  constructor(raw: string) {
    super(`Invalid URL: "${raw}"`);
    this.name = "InvalidUrlError";
  }
}

/** Prepends https:// if no scheme is present. */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Parses and returns a URL object, or throws InvalidUrlError.
 * Always call normalizeUrl first if the input may lack a scheme.
 */
export function validateUrl(raw: string): URL {
  try {
    return new URL(raw);
  } catch {
    throw new InvalidUrlError(raw);
  }
}
