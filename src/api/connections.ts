import axios from 'axios';
import { toast } from 'react-hot-toast';
import { verifyMondayConnection } from './monday';
import { encryptData, decryptData } from '../utils/encryption';
import { getTikTokAuthUrl } from './tiktok/auth';

export interface ApiConfig {
  platform: 'meta' | 'tiktok' | 'google' | 'monday';
  apiKey?: string;
  apiSecret?: string;
  accountId?: string;
  refreshToken?: string;
  appId?: string;
  redirectUri?: string;
  clientSecret?: string;
  defaultBoardId?: string;
  workspaceId?: string;
}

export const verifyApiConnection = async (config: ApiConfig): Promise<boolean> => {
  try {
    if (config.platform === 'tiktok') {
      if (!config.appId || !config.redirectUri || !config.clientSecret) {
        throw new Error('Missing required TikTok credentials');
      }

      // Store TikTok credentials securely
      const credentials = {
        appId: config.appId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri
      };
      localStorage.setItem('tiktokAppCredentials', encryptData(JSON.stringify(credentials)));

      // For TikTok, we'll initiate the OAuth flow
      const authUrl = getTikTokAuthUrl(config.appId, config.redirectUri);
      window.location.href = authUrl;
      return false;
    }

    // ... rest of the platforms verification logic ...
    return false;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || 
                     error.response?.data?.message || 
                     `Failed to verify ${config.platform} connection`;
      toast.error(message);
      console.error('API Error:', error.response?.data);
    } else {
      toast.error(`Unexpected error verifying ${config.platform} connection`);
      console.error('Verification Error:', error);
    }
    return false;
  }
};

export const saveApiConfig = async (config: ApiConfig): Promise<void> => {
  try {
    const isValid = await verifyApiConnection(config);
    if (!isValid && config.platform !== 'tiktok') {
      throw new Error(`Failed to verify ${config.platform} connection`);
    }

    const connections = JSON.parse(localStorage.getItem('adPlatformConnections') || '{}');
    
    if (config.platform === 'tiktok') {
      connections.tiktok = {
        appId: config.appId,
        redirectUri: config.redirectUri,
        clientSecret: config.clientSecret,
        status: 'pending',
        verificationStatus: 'pending'
      };
      localStorage.setItem('adPlatformConnections', JSON.stringify(connections));
      await verifyApiConnection(config);
      return;
    }

    connections[config.platform] = {
      ...config,
      lastVerified: new Date().toISOString(),
      status: 'connected',
      verificationStatus: 'verified'
    };
    
    localStorage.setItem('adPlatformConnections', JSON.stringify(connections));
    toast.success(`${config.platform} credentials saved successfully`);
  } catch (error) {
    toast.error(`Failed to save ${config.platform} credentials`);
    throw error;
  }
};