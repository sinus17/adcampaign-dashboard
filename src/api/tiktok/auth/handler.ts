import { TikTokCredentials, TikTokTokens } from '../../../types/tiktok';
import { exchangeToken } from './tokens';
import { validateState } from './state';

export const handleTikTokAuth = async (code: string, credentials: TikTokCredentials): Promise<TikTokTokens> => {
  try {
    console.log('Processing TikTok auth:', {
      appId: credentials.appId,
      codePrefix: code.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });

    const tokens = await exchangeToken(code, credentials);

    // Store the connection details
    const connections = JSON.parse(localStorage.getItem('adPlatformConnections') || '{}');
    connections.tiktok = {
      ...connections.tiktok,
      ...tokens,
      appId: credentials.appId,
      status: 'connected',
      verificationStatus: 'verified',
      lastVerified: new Date().toISOString()
    };
    localStorage.setItem('adPlatformConnections', JSON.stringify(connections));

    return tokens;
  } catch (error) {
    console.error('TikTok auth error:', error);
    throw error;
  }
};