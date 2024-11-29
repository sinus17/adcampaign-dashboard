import React from 'react';
import { Report } from '../../types/report';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { fetchReportData } from '../../api/reports';
import { formatPercent } from '../../utils/formatters';

interface DemographicsChartsProps {
  report: Report;
  dateRange: { start: string; end: string };
}

const GENDER_COLORS = {
  male: '#002a88',    // primary color
  female: '#3358a7',  // primary-400
  unknown: '#99abd3'  // primary-200
};

const AGE_COLORS = [
  '#e6eaf4', // primary-50
  '#ccd5e9', // primary-100
  '#99abd3', // primary-200
  '#6682bd', // primary-300
  '#3358a7', // primary-400
  '#002a88', // primary
];

export const DemographicsCharts: React.FC<DemographicsChartsProps> = ({ report, dateRange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['reportData', report.id, dateRange],
    queryFn: () => fetchReportData(report, dateRange)
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-[400px] bg-white/50 rounded"></div>
      </div>
    );
  }

  if (!data?.campaigns) return null;

  // Aggregate demographics data across all campaigns
  const aggregatedData = data.campaigns.reduce(
    (acc, campaign) => {
      if (!campaign.demographics) return acc;

      // Age data
      campaign.demographics.age.forEach(({ range, percentage }) => {
        const existing = acc.age.find(a => a.range === range);
        if (existing) {
          existing.percentage += percentage * (campaign.clicks / acc.totalClicks);
        } else {
          acc.age.push({ range, percentage: percentage * (campaign.clicks / acc.totalClicks) });
        }
      });

      // Gender data
      campaign.demographics.gender.forEach(({ type, percentage }) => {
        const existing = acc.gender.find(g => g.type === type);
        if (existing) {
          existing.percentage += percentage * (campaign.clicks / acc.totalClicks);
        } else {
          acc.gender.push({ type, percentage: percentage * (campaign.clicks / acc.totalClicks) });
        }
      });

      return acc;
    },
    {
      age: [] as { range: string; percentage: number }[],
      gender: [] as { type: string; percentage: number }[],
      totalClicks: data.campaigns.reduce((sum, c) => sum + c.clicks, 0)
    }
  );

  // Sort age ranges correctly
  aggregatedData.age.sort((a, b) => {
    const aStart = parseInt(a.range.split('-')[0]);
    const bStart = parseInt(b.range.split('-')[0]);
    return aStart - bStart;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-2 rounded">
          <p className="text-sm">{`${payload[0].name}: ${formatPercent(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Age Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <BarChart data={aggregatedData.age}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6eaf4" />
              <XAxis dataKey="range" />
              <YAxis tickFormatter={(value) => formatPercent(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percentage" fill="#002a88">
                {aggregatedData.age.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Gender Distribution</h3>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={aggregatedData.gender}
                dataKey="percentage"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label={({ type, percentage }) => `${type} ${formatPercent(percentage)}`}
              >
                {aggregatedData.gender.map((entry) => (
                  <Cell 
                    key={entry.type}
                    fill={GENDER_COLORS[entry.type as keyof typeof GENDER_COLORS] || GENDER_COLORS.unknown}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};