import React from 'react';
import { Report } from '../../types/report';
import {
  LineChart,
  Line,
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

interface ReportChartsProps {
  report: Report;
  dateRange: { start: string; end: string };
  type: 'trends' | 'distribution';
}

const COLORS = ['#1877F2', '#000000', '#DB4437'];

export const ReportCharts: React.FC<ReportChartsProps> = ({ report, type }) => {
  const trendData = [
    { date: '03/01', meta: 2400, tiktok: 1800, google: 3200 },
    { date: '03/05', meta: 3200, tiktok: 2800, google: 4100 },
    { date: '03/10', meta: 2800, tiktok: 3500, google: 3800 },
    { date: '03/15', meta: 3600, tiktok: 4200, google: 4300 }
  ];

  const distributionData = [
    { name: 'Meta Ads', value: 35 },
    { name: 'TikTok Ads', value: 30 },
    { name: 'Google Ads', value: 35 }
  ];

  if (type === 'trends') {
    return (
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="meta" stroke="#1877F2" name="Meta Ads" />
            <Line type="monotone" dataKey="tiktok" stroke="#000000" name="TikTok Ads" />
            <Line type="monotone" dataKey="google" stroke="#DB4437" name="Google Ads" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={140}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {distributionData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};