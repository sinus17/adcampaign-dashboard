import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Report } from '../types/report';
import { ReportMetrics } from '../components/reports/ReportMetrics';
import { ReportCharts } from '../components/reports/ReportCharts';
import { ReportTable } from '../components/reports/ReportTable';
import { DateRangePicker } from '../components/reports/DateRangePicker';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';

const SharedReport: React.FC = () => {
  const { reportId } = useParams();
  const [dateRange, setDateRange] = useState({ start: '2024-02-15', end: '2024-03-15' });

  const { data: reports = [], isLoading } = useSupabaseQuery<Report[]>(
    ['report', reportId],
    'reports',
    {
      match: { id: reportId },
      limit: 1
    }
  );

  const report = reports[0];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Not Found</h2>
          <p className="text-gray-600">This report is no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="glass rounded-xl p-6">
          <h1 className="text-2xl font-bold text-primary mb-2">{report.name}</h1>
          <div className="flex gap-2">
            {report.platforms.map((platform) => (
              <span
                key={platform}
                className="px-2 py-1 bg-primary-50 text-primary rounded-full text-xs capitalize"
              >
                {platform}
              </span>
            ))}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-primary">Performance Overview</h2>
            {report.enable_date_range && (
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onChange={setDateRange}
              />
            )}
          </div>
          <ReportMetrics report={report} dateRange={dateRange} />
        </div>

        {report.platforms && report.platforms.length > 1 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Performance Trends</h2>
              <ReportCharts report={report} dateRange={dateRange} type="trends" />
            </div>
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Platform Distribution</h2>
              <ReportCharts report={report} dateRange={dateRange} type="distribution" />
            </div>
          </div>
        )}

        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-primary mb-6">Campaign Performance</h2>
          <ReportTable report={report} dateRange={dateRange} />
        </div>
      </div>
    </div>
  );
};

export default SharedReport;