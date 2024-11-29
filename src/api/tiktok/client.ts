import axios from 'axios';
import { decryptData } from '../../utils/encryption';
import { refreshTikTokToken } from './auth';
import { tryProxies } from './proxies';

const TIKTOK_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

export const getTikTokClient = async () => {
  const connections = JSON.parse(localStorage.getItem('adPlatformConnections') || '{}');
  const tiktokConfig = connections.tiktok;

  if (!tiktokConfig?.accessToken) {
    throw new Error('TikTok not configured');
  }

  // Check if token needs refresh (5 minutes buffer)
  const expiryTime = new Date(tiktokConfig.tokenExpiry).getTime();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (Date.now() + fiveMinutes >= expiryTime) {
    const newTokens = await refreshTikTokToken();
    if (!newTokens) {
      throw new Error('Failed to refresh TikTok token');
    }
    tiktokConfig.accessToken = newTokens.accessToken;
  }

  const decryptedAccessToken = decryptData(tiktokConfig.accessToken);

  return {
    get: async <T>(endpoint: string, params?: any): Promise<T> => {
      return tryProxies(`${TIKTOK_API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Access-Token': decryptedAccessToken,
          'Content-Type': 'application/json'
        }
      });
    },
    post: async <T>(endpoint: string, data?: any): Promise<T> => {
      return tryProxies(`${TIKTOK_API_BASE}${endpoint}`, {
        method: 'POST',
        data,
        headers: {
          'Access-Token': decryptedAccessToken,
          'Content-Type': 'application/json'
        }
      });
    }
  };
};

export const verifyTikTokAccess = async (accessToken: string, advertiserId: string): Promise<boolean> => {
  try {
    const response = await tryProxies(`${TIKTOK_API_BASE}/advertiser/info/`, {
      method: 'GET',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    return !!response?.data?.list?.[0];
  } catch (error) {
    console.error('Failed to verify TikTok access:', error);
    return false;
  }
};