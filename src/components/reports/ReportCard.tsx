import React from 'react';
import { Report } from '../../types/report';
import { 
  AiOutlineLoading3Quarters,
  AiOutlineCheckCircle,
  AiOutlineWarning,
  AiOutlineDownload,
  AiOutlineShareAlt,
  AiOutlineEdit,
  AiOutlineDelete
} from 'react-icons/ai';

interface ReportCardProps {
  report: Report;
  onDownload: (reportId: string) => void;
  onEdit: (reportId: string) => void;
  onShare: (reportId: string) => void;
  onDelete: (reportId: string) => void;
  onOpen: (reportId: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ 
  report, 
  onDownload, 
  onEdit,
  onShare,
  onDelete,
  onOpen
}) => {
  const statusIcons = {
    generating: <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin text-primary" />,
    ready: <AiOutlineCheckCircle className="w-5 h-5 text-green-600" />,
    error: <AiOutlineWarning className="w-5 h-5 text-red-600" />,
  };

  const statusText = {
    generating: 'Generating',
    ready: 'Ready',
    error: 'Error',
  };

  const shareUrl = `${window.location.origin}/shared/${report.id}`;

  return (
    <div className="glass glass-hover">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 
              onClick={() => report.status === 'ready' && onOpen(report.id)}
              className={`text-lg font-semibold ${
                report.status === 'ready' ? 'text-primary hover:text-primary-600 cursor-pointer' : ''
              }`}
            >
              {report.name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
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
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2">
              {statusIcons[report.status]}
              {statusText[report.status]}
            </span>
            {report.status === 'ready' && (
              <>
                <button
                  onClick={() => onEdit(report.id)}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Edit Report"
                >
                  <AiOutlineEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onShare(report.id)}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Share Report"
                >
                  <AiOutlineShareAlt className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDownload(report.id)}
                  className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Download Report"
                >
                  <AiOutlineDownload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(report.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                  title="Delete Report"
                >
                  <AiOutlineDelete className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {report.share_url && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm text-gray-600">Share URL:</p>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-1 text-sm bg-white border rounded"
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-600"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};