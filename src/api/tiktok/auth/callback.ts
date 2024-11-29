import { validateState } from './state';
import { exchangeToken } from './tokens';
import { AuthError } from './errors';
import { TikTokCredentials } from '../../../types/tiktok';

interface CallbackParams {
  code: string;
  state: string;
}

export const parseCallbackParams = (searchParams: URLSearchParams): CallbackParams => {
  const code = searchParams.get('auth_code');
  const state = searchParams.get('state');

  if (!code || !state) {
    throw new AuthError('Missing required callback parameters', {
      timestamp: new Date().toISOString(),
      params: Object.fromEntries(searchParams.entries())
    });
  }

  return { code, state };
};

export const handleCallback = async (
  params: CallbackParams,
  credentials: TikTokCredentials
): Promise<void> => {
  const { code, state } = params;

  console.log('Processing callback:', {
    codePrefix: code.substring(0, 10) + '...',
    state,
    timestamp: new Date().toISOString()
  });

  if (!validateState(state)) {
    throw new AuthError('Invalid state parameter', {
      timestamp: new Date().toISOString(),
      providedState: state
    });
  }

  await exchangeToken({
    code,
    appId: credentials.appId,
    clientSecret: credentials.clientSecret,
    redirectUri: credentials.redirectUri
  });
};