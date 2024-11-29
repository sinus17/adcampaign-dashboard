import axios from 'axios';
import { Campaign } from '../types/report';
import { toast } from 'react-hot-toast';
import { fetchTikTokCampaigns } from './tiktok';

export const searchCampaigns = async (platform: string, query: string): Promise<Campaign[]> => {
  try {
    const connections = JSON.parse(localStorage.getItem('adPlatformConnections') || '{}');
    
    if (platform === 'meta') {
      const metaConfig = connections.meta;

      if (!metaConfig?.apiKey || !metaConfig?.accountId) {
        toast.error('Meta Ads credentials not found. Please connect your Meta account first.');
        return [];
      }

      const response = await axios.get(
        `https://graph.facebook.com/v19.0/act_${metaConfig.accountId}/campaigns`,
        {
          params: {
            access_token: metaConfig.apiKey,
            fields: 'id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(last_30d){spend,impressions,clicks,conversions,ctr,cost_per_action_type}',
            limit: 100,
            ...(query && {
              filtering: JSON.stringify([{
                field: "name",
                operator: "CONTAIN",
                value: query
              }])
            })
          }
        }
      );

      const campaigns = response.data?.data || [];
      return campaigns.map((campaign: any) => {
        const insights = campaign.insights?.data?.[0] || {};
        const budget = parseFloat(campaign.daily_budget || campaign.lifetime_budget || '0') / 100;
        const spent = parseFloat(insights.spend || '0');
        const clicks = parseInt(insights.clicks || '0', 10);
        const impressions = parseInt(insights.impressions || '0', 10);
        const conversions = parseInt(insights.conversions || '0', 10);
        const ctr = clicks / impressions || 0;
        const cpc = spent / clicks || 0;

        return {
          id: campaign.id,
          name: campaign.name,
          platform: 'meta',
          status: campaign.status.toLowerCase(),
          budget,
          spent,
          impressions,
          clicks,
          conversions,
          ctr,
          cpc,
          roas: conversions ? (conversions * 50) / spent : 0
        };
      });
    }

    if (platform === 'tiktok') {
      if (!connections.tiktok?.accessToken) {
        toast.error('TikTok Ads credentials not found. Please connect your TikTok account first.');
        return [];
      }
      return await fetchTikTokCampaigns(query);
    }

    return [];
  } catch (error) {
    let errorMessage = 'Failed to fetch campaigns';
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        errorMessage = `${platform} authentication expired. Please reconnect your account.`;
      } else {
        errorMessage = error.response?.data?.error?.message || errorMessage;
      }
      console.error('Campaign search error:', error.response?.data);
    } else {
      console.error('Campaign search error:', error);
    }
    
    toast.error(errorMessage);
    return [];
  }
};