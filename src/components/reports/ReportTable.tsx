import React, { useState } from 'react';
import { Report } from '../../types/report';
import { FaFacebook, FaTiktok, FaGoogle, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { fetchReportData } from '../../api/reports';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

interface ReportTableProps {
  report: Report;
  dateRange: { start: string; end: string };
}

const platformIcons = {
  meta: FaFacebook,
  tiktok: FaTiktok,
  google: FaGoogle
};

export const ReportTable: React.FC<ReportTableProps> = ({ report, dateRange }) => {
  const [sortField, setSortField] = useState<string>('spent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading } = useQuery({
    queryKey: ['reportData', report.id, dateRange],
    queryFn: () => fetchReportData(report, dateRange)
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded w-full mb-2"></div>
        ))}
      </div>
    );
  }

  if (!data?.campaigns) return null;

  const sortedCampaigns = [...data.campaigns].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    return (a[sortField as keyof typeof a] - b[sortField as keyof typeof b]) * multiplier;
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Campaign</th>
            <th className="px-6 py-3">
              <button
                onClick={() => handleSort('impressions')}
                className="flex items-center gap-1"
              >
                Impressions
                {sortField === 'impressions' ? (
                  sortDirection === 'asc' ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />
                ) : (
                  <FaSort className="w-3 h-3" />
                )}
              </button>
            </th>
            <th className="px-6 py-3">
              <button
                onClick={() => handleSort('clicks')}
                className="flex items-center gap-1"
              >
                Clicks
                {sortField === 'clicks' ? (
                  sortDirection === 'asc' ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />
                ) : (
                  <FaSort className="w-3 h-3" />
                )}
              </button>
            </th>
            <th className="px-6 py-3">
              <button
                onClick={() => handleSort('ctr')}
                className="flex items-center gap-1"
              >
                CTR
                {sortField === 'ctr' ? (
                  sortDirection === 'asc' ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />
                ) : (
                  <FaSort className="w-3 h-3" />
                )}
              </button>
            </th>
            <th className="px-6 py-3">
              <button
                onClick={() => handleSort('spent')}
                className="flex items-center gap-1"
              >
                Spend
                {sortField === 'spent' ? (
                  sortDirection === 'asc' ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />
                ) : (
                  <FaSort className="w-3 h-3" />
                )}
              </button>
            </th>
            <th className="px-6 py-3">
              <button
                onClick={() => handleSort('conversions')}
                className="flex items-center gap-1"
              >
                Conversions
                {sortField === 'conversions' ? (
                  sortDirection === 'asc' ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />
                ) : (
                  <FaSort className="w-3 h-3" />
                )}
              </button>
            </th>
            <th className="px-6 py-3">
              <button
                onClick={() => handleSort('cpc')}
                className="flex items-center gap-1"
              >
                CPC
                {sortField === 'cpc' ? (
                  sortDirection === 'asc' ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />
                ) : (
                  <FaSort className="w-3 h-3" />
                )}
              </button>
            </th>
            <th className="px-6 py-3">
              <button
                onClick={() => handleSort('roas')}
                className="flex items-center gap-1"
              >
                ROAS
                {sortField === 'roas' ? (
                  sortDirection === 'asc' ? <FaSortUp className="w-3 h-3" /> : <FaSortDown className="w-3 h-3" />
                ) : (
                  <FaSort className="w-3 h-3" />
                )}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedCampaigns.map((campaign) => {
            const Icon = platformIcons[campaign.platform as keyof typeof platformIcons];
            return (
              <tr key={campaign.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${
                      campaign.platform === 'meta' ? 'text-primary' :
                      campaign.platform === 'tiktok' ? 'text-primary' :
                      'text-primary'
                    }`} />
                    <span className="font-medium">{campaign.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{formatNumber(campaign.impressions)}</td>
                <td className="px-6 py-4">{formatNumber(campaign.clicks)}</td>
                <td className="px-6 py-4">{formatPercent(campaign.clicks / campaign.impressions)}</td>
                <td className="px-6 py-4">{formatCurrency(campaign.spent)}</td>
                <td className="px-6 py-4">{formatNumber(campaign.conversions)}</td>
                <td className="px-6 py-4">{formatCurrency(campaign.cpc)}</td>
                <td className="px-6 py-4">{campaign.roas.toFixed(2)}x</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};