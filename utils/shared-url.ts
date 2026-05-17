import type { ShareIntent } from 'expo-share-intent';

const SHARED_URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
const TRAILING_PUNCTUATION_PATTERN = /[)\].,!?;:]+$/;

function trimUrlCandidate(value: string): string {
  return value.trim().replace(TRAILING_PUNCTUATION_PATTERN, '');
}

function hasValidHostname(hostname: string): boolean {
  const parts = hostname.split('.');
  const tld = parts[parts.length - 1];

  return parts.length >= 2 && tld.length >= 2;
}

export function normalizeHttpUrlInput(value: string): string | null {
  const candidate = trimUrlCandidate(value);

  if (!/^https?:\/\//i.test(candidate)) {
    return null;
  }

  try {
    const parsed = new URL(candidate);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    if (!hasValidHostname(parsed.hostname)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function extractHttpUrlFromText(value: string): string | null {
  const matches = value.match(SHARED_URL_PATTERN);

  if (!matches) {
    return null;
  }

  for (const match of matches) {
    const normalized = normalizeHttpUrlInput(match);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export function getSharedUrlFromIntent(shareIntent: ShareIntent): string | null {
  const candidates = [shareIntent.webUrl, shareIntent.text, shareIntent.meta?.title];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const normalized = extractHttpUrlFromText(candidate);

    if (normalized) {
      return normalized;
    }
  }

  return null;
}
