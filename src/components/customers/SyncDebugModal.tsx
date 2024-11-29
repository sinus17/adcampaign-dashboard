import React from 'react';
import { Modal } from '../shared/Modal';

interface SyncDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  debugData: {
    status: string;
    apiResponse?: any;
    error?: any;
    processedItems: number;
    totalItems: number;
    lastCursor?: string;
  };
}

export const SyncDebugModal: React.FC<SyncDebugModalProps> = ({
  isOpen,
  onClose,
  debugData
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sync Debug Information">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700">Status</h3>
          <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{debugData.status}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700">Progress</h3>
          <div className="mt-1 bg-gray-50 p-2 rounded">
            <p className="text-sm">Processed Items: {debugData.processedItems}</p>
            <p className="text-sm">Total Items: {debugData.totalItems}</p>
            {debugData.lastCursor && (
              <p className="text-sm">Last Cursor: {debugData.lastCursor}</p>
            )}
          </div>
        </div>

        {debugData.apiResponse && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">API Response</h3>
            <pre className="mt-1 bg-gray-50 p-2 rounded overflow-auto max-h-40 text-xs">
              {JSON.stringify(debugData.apiResponse, null, 2)}
            </pre>
          </div>
        )}

        {debugData.error && (
          <div>
            <h3 className="text-sm font-medium text-red-700">Error</h3>
            <pre className="mt-1 bg-red-50 p-2 rounded overflow-auto max-h-40 text-xs text-red-600">
              {JSON.stringify(debugData.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
};