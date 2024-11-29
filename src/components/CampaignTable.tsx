import React from 'react';
import { Campaign } from '../types/campaign';
import { FaFacebook, FaTiktok, FaGoogle } from 'react-icons/fa6';

interface CampaignTableProps {
  campaigns: Campaign[];
}

const platformIcons = {
  meta: FaFacebook,
  tiktok: FaTiktok,
  google: FaGoogle,
};

export const CampaignTable: React.FC<CampaignTableProps> = ({ campaigns }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Platform</th>
            <th className="px-6 py-3">Campaign</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Spent</th>
            <th className="px-6 py-3">Impressions</th>
            <th className="px-6 py-3">CTR</th>
            <th className="px-6 py-3">CPC</th>
            <th className="px-6 py-3">ROAS</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            const Icon = platformIcons[campaign.platform];
            return (
              <tr key={campaign.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Icon className="w-5 h-5" />
                </td>
                <td className="px-6 py-4 font-medium">{campaign.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4">${campaign.spent.toLocaleString()}</td>
                <td className="px-6 py-4">{campaign.impressions.toLocaleString()}</td>
                <td className="px-6 py-4">{(campaign.ctr * 100).toFixed(2)}%</td>
                <td className="px-6 py-4">${campaign.cpc.toFixed(2)}</td>
                <td className="px-6 py-4">{campaign.roas.toFixed(2)}x</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}