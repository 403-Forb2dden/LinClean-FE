import { API_BASE_URL, apiRequest, getClerkSessionToken, type ClerkTokenGetter } from '@/api/api-client';

export type MeResponse = {
  publicId: string;
};

type JwtClaims = {
  azp?: string;
  aud?: string | string[];
  exp?: number;
  iss?: string;
  sub?: string;
};

function decodeJwtClaims(token: string): JwtClaims | null {
  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    return JSON.parse(atob(paddedBase64)) as JwtClaims;
  } catch {
    return null;
  }
}

export async function syncAuthenticatedMember(getToken: ClerkTokenGetter): Promise<MeResponse> {
  const token = await getClerkSessionToken(getToken);

  if (__DEV__) {
    console.log('Clerk token claims', decodeJwtClaims(token));
    console.log('Syncing authenticated member with API', API_BASE_URL);
  }

  return apiRequest<MeResponse>('/api/v1/auth/me', { token });
}
