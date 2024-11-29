import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { Report, ReportFormData } from '../types/report';
import { CreateReportModal } from '../components/reports/CreateReportModal';
import { EditReportModal } from '../components/reports/EditReportModal';
import { ReportCard } from '../components/reports/ReportCard';
import { toast } from 'react-hot-toast';
import { nanoid } from 'nanoid';
import { useNavigate } from 'react-router-dom';
import { useSupabaseQuery, useSupabaseMutation } from '../hooks/useSupabaseQuery';

function Reports() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { data: reports = [], refetch } = useSupabaseQuery<Report>(
    ['reports'],
    'reports',
    {
      order: { column: 'created_at', ascending: false }
    }
  );

  const reportMutation = useSupabaseMutation<Report>(
    'reports',
    {
      onSuccess: (data) => {
        if (isCreateModalOpen) {
          setIsCreateModalOpen(false);
          toast.success('Report generation started');
          
          setTimeout(async () => {
            await reportMutation.mutateAsync({
              type: 'update',
              data: { id: data.id, status: 'ready' }
            });
            toast.success('Report generated successfully');
          }, 3000);
        } else {
          setIsEditModalOpen(false);
          toast.success('Report updated successfully');
        }
      },
      onError: (error) => {
        console.error('Report mutation error:', error);
        toast.error('Failed to process report');
      }
    }
  );

  const handleCreateReport = async (data: ReportFormData) => {
    try {
      setIsLoading(true);
      
      await reportMutation.mutateAsync({
        type: 'insert',
        data: {
          id: nanoid(),
          name: data.name,
          platforms: data.platforms,
          metrics: data.metrics,
          campaigns: data.campaigns,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          status: 'generating',
          enable_date_range: data.enableDateRange || false
        }
      });
    } catch (error) {
      console.error('Create report error:', error);
      toast.error('Failed to create report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReport = async (data: ReportFormData) => {
    if (!selectedReport) return;

    try {
      setIsLoading(true);
      
      await reportMutation.mutateAsync({
        type: 'update',
        data: {
          id: selectedReport.id,
          name: data.name,
          platforms: data.platforms,
          metrics: data.metrics,
          campaigns: data.campaigns,
          last_updated: new Date().toISOString(),
          status: 'generating',
          enable_date_range: data.enableDateRange
        }
      });

      setTimeout(async () => {
        await reportMutation.mutateAsync({
          type: 'update',
          data: { 
            id: selectedReport.id,
            status: 'ready'
          }
        });
      }, 3000);
    } catch (error) {
      console.error('Edit report error:', error);
      toast.error('Failed to update report');
    } finally {
      setIsLoading(false);
      setSelectedReport(null);
    }
  };

  const handleDownload = async (reportId: string) => {
    toast.success('Report download started');
  };

  const handleEdit = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      setSelectedReport(report);
      setIsEditModalOpen(true);
    }
  };

  const handleShare = async (reportId: string) => {
    try {
      const shareUrl = `${window.location.origin}/reports/${reportId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      await reportMutation.mutateAsync({
        type: 'update',
        data: { 
          id: reportId,
          share_url: shareUrl
        }
      });
      
      toast.success('Share URL copied to clipboard');
    } catch (error) {
      console.error('Share report error:', error);
      toast.error('Failed to generate share URL');
    }
  };

  const handleDelete = async (reportId: string) => {
    try {
      await reportMutation.mutateAsync({
        type: 'delete',
        data: { id: reportId }
      });
      toast.success('Report deleted successfully');
      await refetch();
    } catch (error) {
      console.error('Delete report error:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleOpen = (reportId: string) => {
    navigate(`/reports/${reportId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-primary">Reports</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
        >
          <FaPlus className="w-4 h-4" />
          Create New Report
        </button>
      </div>

      <div className="grid gap-6">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onDownload={handleDownload}
            onEdit={handleEdit}
            onShare={handleShare}
            onDelete={handleDelete}
            onOpen={handleOpen}
          />
        ))}
        {reports.length === 0 && (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-gray-500">No reports yet. Create your first report!</p>
          </div>
        )}
      </div>

      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateReport}
        isLoading={isLoading}
      />

      {selectedReport && (
        <EditReportModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedReport(null);
          }}
          onSubmit={handleEditReport}
          report={selectedReport}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default Reports;