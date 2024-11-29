import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { start: string; end: string }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange
}) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <FaCalendarAlt className="w-4 h-4 text-gray-500" />
      <select
        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        value="last30"
        onChange={() => {}}
      >
        <option value="last7">Last 7 days</option>
        <option value="last30">Last 30 days</option>
        <option value="last90">Last 90 days</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>
  );
};