import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Campaign } from '../types/campaign';

interface PerformanceChartProps {
  campaigns: Campaign[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ campaigns }) => {
  // Aggregate data by platform
  const data = campaigns.reduce((acc: any[], campaign) => {
    const existingDate = acc.find(item => item.date === campaign.startDate);
    if (existingDate) {
      existingDate[`${campaign.platform}Spent`] = (existingDate[`${campaign.platform}Spent`] || 0) + campaign.spent;
      existingDate[`${campaign.platform}ROAS`] = (existingDate[`${campaign.platform}ROAS`] || 0) + campaign.roas;
    } else {
      acc.push({
        date: campaign.startDate,
        [`${campaign.platform}Spent`]: campaign.spent,
        [`${campaign.platform}ROAS`]: campaign.roas,
      });
    }
    return acc;
  }, []);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="metaSpent" stroke="#1877F2" name="Meta Spent" />
          <Line yAxisId="left" type="monotone" dataKey="tiktokSpent" stroke="#000000" name="TikTok Spent" />
          <Line yAxisId="left" type="monotone" dataKey="googleSpent" stroke="#EA4335" name="Google Spent" />
          <Line yAxisId="right" type="monotone" dataKey="metaROAS" stroke="#4267B2" name="Meta ROAS" strokeDasharray="5 5" />
          <Line yAxisId="right" type="monotone" dataKey="tiktokROAS" stroke="#444444" name="TikTok ROAS" strokeDasharray="5 5" />
          <Line yAxisId="right" type="monotone" dataKey="googleROAS" stroke="#DB4437" name="Google ROAS" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}