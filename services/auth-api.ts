import { Platform } from 'react-native';

type ApiResponse<T> = {
  data: T;
};

type MeResponse = {
  publicId: string;
};

type JwtClaims = {
  azp?: string;
  aud?: string | string[];
  exp?: number;
  iss?: string;
  sub?: string;
};

const defaultApiBaseUrl = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;

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

export async function syncAuthenticatedMember(getToken: () => Promise<string | null>) {
  const token = await getToken();

  if (!token) {
    throw new Error('Missing Clerk session token');
  }

  if (__DEV__) {
    console.log('Clerk token claims', decodeJwtClaims(token));
    console.log('Syncing authenticated member with API', API_BASE_URL);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Failed to sync authenticated member: ${response.status} ${responseText}`);
  }

  return response.json() as Promise<ApiResponse<MeResponse>>;
}
