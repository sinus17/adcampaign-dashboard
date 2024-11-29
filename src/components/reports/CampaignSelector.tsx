import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BiSearch } from 'react-icons/bi';
import { AiOutlineCheck } from 'react-icons/ai';
import { FaFacebook, FaTiktok, FaGoogle } from 'react-icons/fa6';
import { Campaign } from '../../types/report';
import { searchCampaigns } from '../../api/campaigns';
import debounce from 'lodash/debounce';
import { formatCurrency } from '../../utils/formatters';

interface CampaignSelectorProps {
  selectedCampaigns: string[];
  onSelectionChange: (campaigns: string[]) => void;
  platforms: ('meta' | 'tiktok' | 'google')[];
  allowMultiple?: boolean;
}

const platformIcons = {
  meta: FaFacebook,
  tiktok: FaTiktok,
  google: FaGoogle
};

export const CampaignSelector: React.FC<CampaignSelectorProps> = ({
  selectedCampaigns,
  onSelectionChange,
  platforms,
  allowMultiple = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  const { data: campaignResults = {}, isLoading } = useQuery({
    queryKey: ['campaigns', platforms, searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) {
        return {};
      }

      const results: Record<string, Campaign[]> = {};
      
      for (const platform of platforms) {
        try {
          results[platform] = await searchCampaigns(platform, searchTerm);
        } catch (error) {
          console.error(`Error fetching ${platform} campaigns:`, error);
          results[platform] = [];
        }
      }
      
      return results;
    },
    enabled: searchTerm.length >= 2,
  });

  const handleToggleCampaign = (platform: string, campaign: Campaign) => {
    const campaignKey = `${platform}|${campaign.name}|${campaign.id}`;
    
    if (selectedCampaigns.includes(campaignKey)) {
      onSelectionChange(selectedCampaigns.filter(id => id !== campaignKey));
    } else {
      if (allowMultiple) {
        onSelectionChange([...selectedCampaigns, campaignKey]);
      } else {
        // If not allowing multiple, only keep campaigns from other platforms
        const otherPlatformCampaigns = selectedCampaigns.filter(id => !id.startsWith(`${platform}|`));
        onSelectionChange([...otherPlatformCampaigns, campaignKey]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search campaigns (min. 2 characters)..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>

      {platforms.map(platform => {
        const Icon = platformIcons[platform];
        const campaigns = campaignResults[platform] || [];

        return (
          <div key={platform} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <h3 className="font-medium capitalize">{platform} Campaigns</h3>
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  Searching campaigns...
                </div>
              ) : searchTerm.length < 2 ? (
                <div className="p-4 text-center text-gray-500">
                  Type at least 2 characters to search
                </div>
              ) : campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => handleToggleCampaign(platform, campaign)}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <h4 className="font-medium">{campaign.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Budget: {formatCurrency(campaign.budget)}</span>
                        <span>•</span>
                        <span>ROAS: {campaign.roas.toFixed(2)}x</span>
                      </div>
                    </div>
                    {selectedCampaigns.includes(`${platform}|${campaign.name}|${campaign.id}`) && (
                      <AiOutlineCheck className="text-primary w-5 h-5" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No {platform} campaigns found
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};