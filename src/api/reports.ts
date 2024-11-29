import axios from 'axios';
import { Campaign, Report } from '../types/report';
import { toast } from 'react-hot-toast';

interface PlatformMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
}

export const fetchReportData = async (report: Report, dateRange: { start: string; end: string }) => {
  const metrics: Record<string, PlatformMetrics> = {};
  const campaigns: Campaign[] = [];

  try {
    const connections = JSON.parse(localStorage.getItem('adPlatformConnections') || '{}');

    // Fetch data for each platform in parallel
    await Promise.all(report.platforms.map(async (platform) => {
      const config = connections[platform];
      if (!config) return;

      if (platform === 'meta') {
        const response = await axios.get(
          `https://graph.facebook.com/v19.0/act_${config.accountId}/campaigns`,
          {
            params: {
              access_token: config.apiKey,
              fields: 'id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(last_30d){spend,impressions,clicks,conversions,ctr,cost_per_action_type}',
              filtering: JSON.stringify([{
                field: "id",
                operator: "IN",
                value: report.campaigns
                  .filter(c => c.startsWith('meta|'))
                  .map(c => c.split('|')[2])
              }])
            }
          }
        );

        const metaCampaigns = response.data?.data || [];
        let platformMetrics: PlatformMetrics = {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
          ctr: 0,
          cpc: 0,
          roas: 0
        };

        metaCampaigns.forEach((campaign: any) => {
          const insights = campaign.insights?.data?.[0] || {};
          const budget = parseFloat(campaign.daily_budget || campaign.lifetime_budget || '0') / 100;
          const spent = parseFloat(insights.spend || '0');
          const clicks = parseInt(insights.clicks || '0', 10);
          const impressions = parseInt(insights.impressions || '0', 10);
          const conversions = parseInt(insights.conversions || '0', 10);

          platformMetrics.impressions += impressions;
          platformMetrics.clicks += clicks;
          platformMetrics.spend += spent;
          platformMetrics.conversions += conversions;

          campaigns.push({
            id: campaign.id,
            name: campaign.name,
            platform: 'meta',
            status: campaign.status.toLowerCase(),
            budget,
            spent,
            impressions,
            clicks,
            conversions,
            ctr: clicks / impressions || 0,
            cpc: spent / clicks || 0,
            roas: conversions ? (conversions * 50) / spent : 0
          });
        });

        // Calculate aggregate metrics
        platformMetrics.ctr = platformMetrics.clicks / platformMetrics.impressions || 0;
        platformMetrics.cpc = platformMetrics.spend / platformMetrics.clicks || 0;
        platformMetrics.roas = platformMetrics.conversions ? (platformMetrics.conversions * 50) / platformMetrics.spend : 0;

        metrics[platform] = platformMetrics;
      }

      // Add similar implementations for TikTok and Google Ads
      // using their respective APIs
    }));

    return {
      metrics,
      campaigns: campaigns.sort((a, b) => b.spent - a.spent)
    };
  } catch (error) {
    let errorMessage = 'Failed to fetch report data';
    
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || errorMessage;
    }
    
    toast.error(errorMessage);
    throw error;
  }
};