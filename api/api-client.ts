import { Platform } from 'react-native';

const DEFAULT_API_BASE_URL =
  Platform.select({
    android: 'http://10.0.2.2:8080',
    default: 'http://localhost:8080',
  }) ?? 'http://localhost:8080';

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
).replace(/\/$/, '');

export interface ApiResponse<T> {
  data: T;
}

interface ApiErrorResponse {
  code?: string;
  message?: string;
  timestamp?: string;
  errors?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ClerkTokenGetter = () => Promise<string | null>;

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

export async function getClerkSessionToken(getToken: ClerkTokenGetter): Promise<string> {
  const token = await getToken();

  if (!token) {
    throw new Error('Missing Clerk session token');
  }

  return token;
}

export async function publicApiRequest<T>(
  path: string,
  options: Omit<ApiRequestOptions, 'token'> = {},
): Promise<T> {
  return apiRequest<T>(path, options);
}

export async function authenticatedApiRequest<T>(
  getToken: ClerkTokenGetter,
  path: string,
  options: Omit<ApiRequestOptions, 'token'> = {},
): Promise<T> {
  const token = await getClerkSessionToken(getToken);

  return apiRequest<T>(path, { ...options, token });
}

export async function apiRequest<T>(
  path: string,
  { body, headers, token, method = body === undefined ? 'GET' : 'POST', ...init }: ApiRequestOptions = {},
): Promise<T> {
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  const requestInit: RequestInit = {
    ...init,
    method,
    headers: requestHeaders,
  };

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] ?? 'application/json';
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(buildApiUrl(path), requestInit);
  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw buildApiError(response, responseBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return unwrapApiResponse<T>(responseBody);
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function unwrapApiResponse<T>(body: unknown): T {
  if (isApiResponse<T>(body)) {
    return body.data;
  }

  return body as T;
}

function isApiResponse<T>(body: unknown): body is ApiResponse<T> {
  return typeof body === 'object' && body !== null && 'data' in body;
}

function buildApiError(response: Response, body: unknown) {
  if (isApiErrorResponse(body)) {
    return new ApiError(
      body.message ?? `API request failed with status ${response.status}`,
      response.status,
      body.code,
      body.errors,
    );
  }

  if (typeof body === 'string' && body.length > 0) {
    return new ApiError(body, response.status);
  }

  return new ApiError(`API request failed with status ${response.status}`, response.status);
}

function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  return typeof body === 'object' && body !== null;
}
