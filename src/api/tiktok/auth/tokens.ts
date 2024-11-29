import axios from 'axios';
import { encryptData } from '../../../utils/encryption';
import { TikTokCredentials, TikTokTokens } from '../../../types/tiktok';
import { TIKTOK_CONFIG } from '../config';

export const exchangeToken = async (code: string, credentials: TikTokCredentials): Promise<TikTokTokens> => {
  try {
    console.log('Starting token exchange:', {
      appId: credentials.appId,
      codePrefix: code.substring(0, 10) + '...',
      timestamp: new Date().toISOString()
    });

    const response = await axios.post(
      '/.netlify/functions/tiktok-auth',
      {
        code,
        appId: credentials.appId,
        clientSecret: credentials.clientSecret
      },
      {
        headers: { 
          'Content-Type': 'application/json'
        },
        timeout: TIKTOK_CONFIG.DEFAULT_TIMEOUT
      }
    );

    if (!response.data?.data?.access_token) {
      throw new Error('Invalid response from TikTok API');
    }

    return {
      accessToken: encryptData(response.data.data.access_token),
      refreshToken: encryptData(response.data.data.refresh_token),
      tokenExpiry: new Date(Date.now() + response.data.data.expires_in * 1000).toISOString()
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};

export const refreshToken = async (refreshToken: string, credentials: TikTokCredentials): Promise<TikTokTokens> => {
  try {
    const response = await axios.post(
      '/.netlify/functions/tiktok-refresh',
      {
        refreshToken,
        appId: credentials.appId,
        clientSecret: credentials.clientSecret
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: TIKTOK_CONFIG.DEFAULT_TIMEOUT
      }
    );

    if (!response.data?.data?.access_token) {
      throw new Error('Invalid response from TikTok API');
    }

    return {
      accessToken: encryptData(response.data.data.access_token),
      refreshToken: encryptData(response.data.data.refresh_token),
      tokenExpiry: new Date(Date.now() + response.data.data.expires_in * 1000).toISOString()
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};