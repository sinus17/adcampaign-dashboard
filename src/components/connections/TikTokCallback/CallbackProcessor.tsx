import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseCallbackParams, handleCallback } from '../../../api/tiktok/auth/callback';
import { AuthError } from '../../../api/tiktok/auth/errors';
import { toast } from 'react-hot-toast';
import { TikTokCredentials } from '../../../types/tiktok';
import { decryptData } from '../../../utils/encryption';

interface CallbackProcessorProps {
  onSuccess: () => void;
  onError: (error: Error) => void;
  onDebug?: (data: any) => void;
}

export const CallbackProcessor: React.FC<CallbackProcessorProps> = ({
  onSuccess,
  onError,
  onDebug
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      const debugInfo = {
        timestamp: new Date().toISOString()
      };

      try {
        // Get credentials from storage
        const encryptedCreds = localStorage.getItem('tiktokAppCredentials');
        if (!encryptedCreds) {
          throw new AuthError('TikTok credentials not found');
        }

        const decryptedCreds = decryptData(encryptedCreds);
        const credentials: TikTokCredentials = JSON.parse(decryptedCreds);

        debugInfo.credentials = {
          ...credentials,
          clientSecret: '***********'
        };

        // Parse URL parameters
        const searchParams = new URLSearchParams(window.location.search);
        const params = parseCallbackParams(searchParams);
        
        debugInfo.params = {
          code: params.code.substring(0, 10) + '...',
          state: params.state
        };

        onDebug?.(debugInfo);

        // Process the callback
        await handleCallback(params, credentials);
        
        onSuccess();
        toast.success('Successfully connected to TikTok');
        
        // Redirect after success
        setTimeout(() => {
          navigate('/connections', { replace: true });
        }, 2000);
      } catch (error) {
        const authError = error instanceof AuthError ? error : new AuthError(
          error instanceof Error ? error.message : 'Failed to process callback'
        );

        debugInfo.error = {
          message: authError.message,
          ...authError.details
        };

        onDebug?.(debugInfo);
        onError(authError);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate, onSuccess, onError, onDebug]);

  return null;
};