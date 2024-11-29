import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa6';
import { TikTokCredentials } from '../../../types/tiktok';
import { DebugInfo } from './DebugInfo';
import { ErrorDisplay } from './ErrorDisplay';
import { AuthError, formatErrorMessage } from '../../../api/tiktok/auth/errors';

interface TokenExchangeProps {
  authCode: string;
  credentials: TikTokCredentials;
  onExchangeToken: (code: string, credentials: TikTokCredentials) => Promise<void>;
  onClose: () => void;
}

export const TokenExchange: React.FC<TokenExchangeProps> = ({
  authCode,
  credentials,
  onExchangeToken,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [exchangeStartTime, setExchangeStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (authCode && !isLoading && !error) {
      handleExchange();
    }
  }, [authCode]);

  const handleExchange = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setAttempts(prev => prev + 1);
      setExchangeStartTime(Date.now());

      await onExchangeToken(authCode, credentials);

      // Close any remaining popup windows
      const popups = window.opener ? [window.opener] : [];
      popups.forEach(popup => {
        if (popup && !popup.closed) {
          popup.close();
        }
      });
    } catch (err) {
      setError(err instanceof AuthError ? err : new AuthError(
        err instanceof Error ? err.message : 'Failed to exchange token'
      ));
    } finally {
      setIsLoading(false);
      setExchangeStartTime(null);
    }
  };

  return (
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
        <ErrorDisplay 
          error={formatErrorMessage(error)}
          debugInfo={{
            timestamp: error.details.timestamp,
            attempt: attempts,
            authCode,
            credentials: {
              ...credentials,
              clientSecret: '***********'
            },
            error: {
              message: error.message,
              ...error.details
            }
          }}
        />
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
  );
};