import React from 'react';
import { Report } from '../../types/report';
import { FaEye, FaMousePointer, FaExchangeAlt, FaEuroSign, FaShoppingCart, FaChartLine } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { fetchReportData } from '../../api/reports';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

interface ReportMetricsProps {
  report: Report;
  dateRange: { start: string; end: string };
}

const metricIcons = {
  impressions: FaEye,
  clicks: FaMousePointer,
  ctr: FaExchangeAlt,
  spend: FaEuroSign,
  conversions: FaShoppingCart,
  roas: FaChartLine,
};

const metricLabels = {
  impressions: 'Impressions',
  clicks: 'Clicks',
  ctr: 'CTR',
  spend: 'Spend',
  conversions: 'Conversions',
  roas: 'ROAS',
};

export const ReportMetrics: React.FC<ReportMetricsProps> = ({ report, dateRange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['reportData', report.id, dateRange],
    queryFn: () => fetchReportData(report, dateRange)
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {report.metrics.map((_, i) => (
          <div key={i} className="glass rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  // Calculate totals across all platforms
  const totals = Object.values(data.metrics).reduce((acc, metrics) => ({
    impressions: acc.impressions + metrics.impressions,
    clicks: acc.clicks + metrics.clicks,
    spend: acc.spend + metrics.spend,
    conversions: acc.conversions + metrics.conversions,
    ctr: acc.clicks / acc.impressions || 0,
    cpc: acc.spend / acc.clicks || 0,
    roas: acc.conversions ? (acc.conversions * 50) / acc.spend : 0
  }), {
    impressions: 0,
    clicks: 0,
    spend: 0,
    conversions: 0,
    ctr: 0,
    cpc: 0,
    roas: 0
  });

  // Recalculate CTR after all totals are summed
  totals.ctr = totals.clicks / totals.impressions || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {report.metrics.map((metricKey) => {
        const Icon = metricIcons[metricKey as keyof typeof metricIcons];
        if (!Icon) return null;

        let value = totals[metricKey as keyof typeof totals];
        let displayValue = formatNumber(value);

        if (metricKey === 'ctr') {
          displayValue = formatPercent(value);
        } else if (metricKey === 'spend' || metricKey === 'cpc') {
          displayValue = formatCurrency(value);
        } else if (metricKey === 'roas') {
          displayValue = `${value.toFixed(2)}x`;
        }

        return (
          <div key={metricKey} className="glass rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">{metricLabels[metricKey as keyof typeof metricLabels]}</p>
                <p className="text-2xl font-semibold mt-1">{displayValue}</p>
              </div>
              <div className="p-2 rounded-lg bg-primary-50">
                <Icon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};