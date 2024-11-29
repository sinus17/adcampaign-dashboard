import { TIKTOK_CONFIG } from '../config';
import { generateAuthState } from './state';

export const getTikTokAuthUrl = (appId: string, redirectUri: string): string => {
  if (!appId) {
    throw new Error('App ID is required');
  }

  const state = generateAuthState();
  
  const params = new URLSearchParams({
    app_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: TIKTOK_CONFIG.SCOPES.join(','),
    response_type: 'code'
  });

  return `${TIKTOK_CONFIG.AUTH_URL}?${params.toString()}`;
};