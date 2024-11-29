import React from 'react';
import { Report } from '../../types/report';
import { FaDownload, FaShareAlt, FaEdit, FaFacebook, FaTiktok, FaGoogle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface ReportHeaderProps {
  report: Report;
  onEdit: () => void;
}

const platformIcons = {
  meta: FaFacebook,
  tiktok: FaTiktok,
  google: FaGoogle,
};

export const ReportHeader: React.FC<ReportHeaderProps> = ({ report, onEdit }) => {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/reports/${report.id}`;
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Share URL copied to clipboard');
  };

  const handleDownload = () => {
    toast.success('Report download started');
  };

  return (
    <div className="glass glass-hover">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{report.name}</h1>
            <div className="flex gap-2 mt-2">
              {report.platforms.map((platform) => {
                const Icon = platformIcons[platform as keyof typeof platformIcons];
                
                return (
                  <span
                    key={platform}
                    className="px-2 py-1 bg-primary-50 text-primary rounded-full text-xs capitalize flex items-center gap-1"
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    {platform}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaShareAlt className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 text-white bg-primary hover:bg-primary-600 rounded-lg transition-colors"
            >
              <FaEdit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};