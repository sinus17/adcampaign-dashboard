import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from '../shared/Modal';
import { ReportFormData } from '../../types/report';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { CampaignSelector } from './CampaignSelector';
import { FaFacebook, FaTiktok, FaGoogle } from 'react-icons/fa';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportFormData) => Promise<void>;
  isLoading?: boolean;
}

const availableMetrics = [
  { id: 'impressions', label: 'Impressions', default: true },
  { id: 'clicks', label: 'Clicks', default: true },
  { id: 'ctr', label: 'CTR', default: true },
  { id: 'spend', label: 'Total Spend', default: true },
  { id: 'cpc', label: 'CPC', default: true },
  { id: 'conversions', label: 'Conversions', default: false },
  { id: 'roas', label: 'Return on Ad Spend', default: false },
];

const platforms = [
  { id: 'meta', label: 'Meta Ads', icon: FaFacebook },
  { id: 'tiktok', label: 'TikTok Ads', icon: FaTiktok },
  { id: 'google', label: 'Google Ads', icon: FaGoogle },
];

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    defaultValues: {
      name: '',
      platforms: [],
      metrics: availableMetrics.filter(m => m.default).map(m => m.id),
      campaigns: [],
      enableDateRange: false,
    },
  });

  const selectedPlatforms = watch('platforms');
  const selectedCampaigns = watch('campaigns');

  useEffect(() => {
    if (selectedCampaigns.length > 0) {
      const firstPlatform = selectedPlatforms[0];
      const firstPlatformCampaign = selectedCampaigns.find(campaign => 
        campaign.startsWith(`${firstPlatform}|`)
      );

      if (firstPlatformCampaign) {
        const [_, campaignName] = firstPlatformCampaign.split('|');
        const suffix = selectedCampaigns.length > 1 ? ` +${selectedCampaigns.length - 1}` : '';
        setValue('name', `${campaignName}${suffix}`);
      }
    }
  }, [selectedCampaigns, selectedPlatforms, setValue]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Report">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platforms
          </label>
          <Controller
            control={control}
            name="platforms"
            rules={{ required: 'Select at least one platform' }}
            render={({ field }) => (
              <div className="space-y-2">
                {platforms.map((platform) => (
                  <label key={platform.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={platform.id}
                      checked={field.value.includes(platform.id as any)}
                      onChange={(e) => {
                        const value = platform.id as 'meta' | 'tiktok' | 'google';
                        if (e.target.checked) {
                          field.onChange([...field.value, value]);
                        } else {
                          field.onChange(field.value.filter((p) => p !== value));
                          setValue('campaigns', selectedCampaigns.filter(c => !c.startsWith(`${platform.id}|`)));
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <platform.icon className="w-4 h-4 text-primary" />
                    {platform.label}
                  </label>
                ))}
              </div>
            )}
          />
          {errors.platforms && (
            <p className="mt-1 text-sm text-red-600">{errors.platforms.message}</p>
          )}
        </div>

        {selectedPlatforms.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaigns
            </label>
            <Controller
              control={control}
              name="campaigns"
              rules={{ required: 'Select at least one campaign' }}
              render={({ field }) => (
                <CampaignSelector
                  selectedCampaigns={field.value}
                  onSelectionChange={field.onChange}
                  platforms={selectedPlatforms}
                  allowMultiple={true}
                />
              )}
            />
            {errors.campaigns && (
              <p className="mt-1 text-sm text-red-600">{errors.campaigns.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Metrics
          </label>
          <Controller
            control={control}
            name="metrics"
            rules={{ required: 'Select at least one metric' }}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2">
                {availableMetrics.map((metric) => (
                  <label key={metric.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={metric.id}
                      checked={field.value.includes(metric.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...field.value, metric.id]);
                        } else {
                          field.onChange(field.value.filter((m) => m !== metric.id));
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    {metric.label}
                  </label>
                ))}
              </div>
            )}
          />
          {errors.metrics && (
            <p className="mt-1 text-sm text-red-600">{errors.metrics.message}</p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...control.register('enableDateRange')}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              Enable Date Range Selection
            </span>
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {isLoading && <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />}
            Generate Report
          </button>
        </div>
      </form>
    </Modal>
  );
};