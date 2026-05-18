import type { ShareIntent } from 'expo-share-intent';

const SHARED_URL_PATTERN = /https?:\/\/[^\s<>"']+/gi;
const TRAILING_PUNCTUATION_PATTERN = /[)\].,!?;:]+$/;

function trimUrlCandidate(value: string): string {
  return value.trim().replace(TRAILING_PUNCTUATION_PATTERN, '');
}

function getRawHostname(value: string): string | null {
  const authority = value.match(/^https?:\/\/([^/?#]+)/i)?.[1];
  if (!authority) return null;

  return authority.split('@').pop()?.split(':')[0] ?? null;
}

function hasValidHostname(hostname: string): boolean {
  const labels = hostname.split('.');
  if (labels.length < 2) return false;
  if (labels.some((label) => !label)) return false;

  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,}$/i.test(tld)) return false;

  return labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
}

export function normalizeHttpUrlInput(value: string): string | null {
  const trimmed = trimUrlCandidate(value);

  if (!trimmed || /\s/.test(trimmed)) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const rawHostname = getRawHostname(candidate);

  if (!rawHostname || !hasValidHostname(rawHostname)) {
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
