import React, { useState, useEffect } from 'react';
import { Modal } from '../shared/Modal';
import { FaSpinner } from 'react-icons/fa6';
import { TikTokCredentials } from '../../types/tiktok';
import { handleTikTokAuth } from '../../api/tiktok/auth';

interface TikTokTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  authCode: string;
  credentials: TikTokCredentials;
}

export const TikTokTokenModal: React.FC<TikTokTokenModalProps> = ({
  isOpen,
  onClose,
  authCode,
  credentials
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (isOpen && authCode && !isLoading && !error) {
      handleExchange();
    }
  }, [isOpen, authCode]);

  const handleExchange = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAttempts(prev => prev + 1);
      
      setDebugInfo({
        timestamp: new Date().toISOString(),
        attempt: attempts + 1,
        authCode,
        credentials: {
          ...credentials,
          clientSecret: '***********'
        }
      });

      await handleTikTokAuth(authCode, credentials);
      onClose();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to exchange token';
      setError(message);
      
      setDebugInfo(prev => ({
        ...prev,
        success: false,
        error: err instanceof Error ? {
          name: err.name,
          message: err.message,
          stack: err.stack
        } : err
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="TikTok Authentication - Step 2">
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            {isLoading ? 'Exchanging authorization code for access token...' : 
             error ? 'Failed to exchange authorization code:' :
             'Ready to exchange authorization code for access token:'}
          </p>
          <p className="mt-2 font-mono text-sm break-all">{authCode}</p>
          {attempts > 1 && (
            <p className="mt-2 text-sm text-gray-500">
              Attempt {attempts} of 3
            </p>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              {showDebug ? 'Hide' : 'Show'} Debug Information
            </button>
            {showDebug && debugInfo && (
              <div className="mt-4">
                <p className="text-sm font-medium text-red-700">Debug Information:</p>
                <pre className="mt-2 text-xs overflow-auto max-h-60 p-2 bg-red-100 rounded">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          {error && attempts < 3 && (
            <button
              onClick={handleExchange}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {isLoading && <FaSpinner className="w-4 h-4 animate-spin" />}
              Retry Token Exchange
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};