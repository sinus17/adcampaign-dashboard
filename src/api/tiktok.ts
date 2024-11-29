import axios from 'axios';
import { toast } from 'react-hot-toast';
import { encryptData, decryptData } from '../utils/encryption';
import { Campaign } from '../types/campaign';
import { handleAuthError } from './tiktok/auth/errors';

const TIKTOK_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';
const PROXY_URL = 'https://corsproxy.io/?';

export const getTikTokAuthUrl = (appId: string, redirectUri: string): string => {
  const state = Math.random().toString(36).substring(7);
  const encryptedState = encryptData(state);
  localStorage.setItem('tiktokAuthState', encryptedState);
  
  const params = new URLSearchParams({
    app_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: 'user.info,ad.read,ad.write',
    response_type: 'code'
  });

  return `${TIKTOK_API_BASE}/oauth2/access_token/?${params.toString()}`;
};

export const getTikTokClient = async () => {
  const connections = JSON.parse(localStorage.getItem('adPlatformConnections') || '{}');
  const tiktokConfig = connections.tiktok;

  if (!tiktokConfig?.accessToken) {
    throw new Error('TikTok not configured');
  }

  const decryptedAccessToken = decryptData(tiktokConfig.accessToken);

  return axios.create({
    baseURL: PROXY_URL + encodeURIComponent(TIKTOK_API_BASE),
    headers: {
      'Access-Token': decryptedAccessToken,
      'Content-Type': 'application/json'
    }
  });
};

export const fetchTikTokCampaigns = async (query?: string): Promise<Campaign[]> => {
  try {
    const connections = JSON.parse(localStorage.getItem('adPlatformConnections') || '{}');
    const tiktokConfig = connections.tiktok;

    if (!tiktokConfig?.accessToken) {
      throw new Error('TikTok not configured. Please connect your TikTok account first.');
    }

    const client = await getTikTokClient();

    const response = await client.get('/campaign/get/', {
      params: {
        page_size: 100,
        fields: [
          'campaign_id',
          'campaign_name',
          'status',
          'budget',
          'budget_mode',
          'objective',
          'campaign_type',
          'create_time',
          'modify_time'
        ],
        ...(query && {
          filtering: {
            campaign_name: { contains: query }
          }
        })
      }
    });

    if (!response.data?.data?.list) {
      throw new Error('Invalid response from TikTok API');
    }

    // Get campaign metrics in a separate call
    const campaignIds = response.data.data.list.map((c: any) => c.campaign_id);
    const metricsResponse = await client.get('/campaign/stats/', {
      params: {
        campaign_ids: campaignIds,
        metrics: [
          'spend',
          'impressions',
          'clicks',
          'conversions',
          'cost_per_conversion',
          'conversion_rate',
          'ctr',
          'cpc'
        ],
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      }
    });

    if (!metricsResponse.data?.data?.list) {
      throw new Error('Invalid metrics response from TikTok API');
    }

    const campaignMetrics = metricsResponse.data.data.list;
    const campaigns = response.data.data.list;

    return campaigns.map((campaign: any) => {
      const metrics = campaignMetrics.find((m: any) => m.campaign_id === campaign.campaign_id) || {};
      const budget = parseFloat(campaign.budget || '0');
      const spent = parseFloat(metrics.spend || '0');
      const clicks = parseInt(metrics.clicks || '0', 10);
      const impressions = parseInt(metrics.impressions || '0', 10);
      const conversions = parseInt(metrics.conversions || '0', 10);
      const ctr = parseFloat(metrics.ctr || '0');
      const cpc = parseFloat(metrics.cpc || '0');

      return {
        id: campaign.campaign_id,
        name: campaign.campaign_name,
        platform: 'tiktok',
        status: campaign.status.toLowerCase(),
        budget,
        spent,
        impressions,
        clicks,
        conversions,
        ctr,
        cpc,
        roas: conversions ? (conversions * 50) / spent : 0,
        startDate: campaign.create_time,
        endDate: campaign.modify_time
      };
    });
  } catch (error) {
    console.error('Failed to fetch TikTok campaigns:', error);
    
    let errorMessage = 'Failed to fetch TikTok campaigns';
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        errorMessage = 'TikTok authentication expired. Please reconnect your account.';
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    return [];
  }
};