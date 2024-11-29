import React from 'react';
import { FaFacebook, FaTiktok, FaGoogle } from 'react-icons/fa6';
import { Campaign } from '../types/campaign';

interface PlatformCardProps {
  platform: 'meta' | 'tiktok' | 'google';
  campaigns: Campaign[];
}

const platformIcons = {
  meta: FaFacebook,
  tiktok: FaTiktok,
  google: FaGoogle,
};

const platformColors = {
  meta: 'bg-blue-500',
  tiktok: 'bg-black',
  google: 'bg-red-500',
};

export const PlatformCard: React.FC<PlatformCardProps> = ({ platform, campaigns }) => {
  const Icon = platformIcons[platform];
  const bgColor = platformColors[platform];
  
  const totalSpent = campaigns.reduce((acc, campaign) => acc + campaign.spent, 0);
  const totalConversions = campaigns.reduce((acc, campaign) => acc + campaign.conversions, 0);
  const avgRoas = campaigns.reduce((acc, campaign) => acc + campaign.roas, 0) / campaigns.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold capitalize">{platform} Ads</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Spent</p>
          <p className="text-lg font-semibold">${totalSpent.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Conversions</p>
          <p className="text-lg font-semibold">{totalConversions}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg ROAS</p>
          <p className="text-lg font-semibold">{avgRoas.toFixed(2)}x</p>
        </div>
      </div>
    </div>
  );
}