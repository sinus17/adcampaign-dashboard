import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal } from '../shared/Modal';
import { Report, ReportFormData } from '../../types/report';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { CampaignSelector } from './CampaignSelector';

interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReportFormData) => Promise<void>;
  report: Report;
  isLoading?: boolean;
}

const platforms = [
  { id: 'meta', label: 'Meta Ads' },
  { id: 'tiktok', label: 'TikTok Ads' },
  { id: 'google', label: 'Google Ads' },
];

const availableMetrics = [
  { id: 'impressions', label: 'Impressions' },
  { id: 'clicks', label: 'Clicks' },
  { id: 'ctr', label: 'CTR' },
  { id: 'spend', label: 'Spend' },
  { id: 'conversions', label: 'Conversions' },
  { id: 'cpa', label: 'Cost per Acquisition' },
  { id: 'roas', label: 'Return on Ad Spend' },
];

export const EditReportModal: React.FC<EditReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  report,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ReportFormData & { enableDateRange: boolean }>({
    defaultValues: {
      name: report.name,
      platforms: report.platforms,
      campaigns: report.campaigns,
      metrics: report.metrics,
      enableDateRange: report.enableDateRange || false,
    },
  });

  const selectedPlatforms = watch('platforms');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Report">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Name
          </label>
          <input
            {...register('name', { required: 'Report name is required' })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
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
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('enableDateRange')}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading && <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};