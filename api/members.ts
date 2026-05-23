import {
  authenticatedApiRequest,
  type ClerkTokenGetter,
} from '@/api/api-client';

export function withdrawMember(getToken: ClerkTokenGetter) {
  return authenticatedApiRequest<void>(getToken, '/api/v1/members/me', {
    method: 'DELETE',
  });
}
