import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validateState, handleTikTokAuth } from '../../api/tiktok/auth';
import { decryptData } from '../../utils/encryption';
import { FaSpinner, FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { toast } from 'react-hot-toast';
import { TikTokCredentials } from '../../types/tiktok';

export const TikTokCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let mounted = true;
    
    const processCallback = async () => {
      const debug: any = {
        timestamp: new Date().toISOString()
      };

      try {
        const code = searchParams.get('auth_code');
        const state = searchParams.get('state');
        debug.code = code ? code.substring(0, 10) + '...' : undefined;
        debug.state = state;

        if (!code || !state) {
          throw new Error('Missing required parameters');
        }

        if (!validateState(state)) {
          throw new Error('Invalid state parameter');
        }

        const encryptedCreds = localStorage.getItem('tiktokAppCredentials');
        if (!encryptedCreds) {
          throw new Error('TikTok credentials not found');
        }

        const decryptedCreds = decryptData(encryptedCreds);
        const credentials: TikTokCredentials = JSON.parse(decryptedCreds);
        
        debug.credentials = {
          ...credentials,
          clientSecret: '***********'
        };

        const tokens = await handleTikTokAuth(code, credentials);

        // Store the connection details
        const connections = JSON.parse(localStorage.getItem('adPlatformConnections') || '{}');
        connections.tiktok = {
          ...connections.tiktok,
          ...tokens,
          appId: credentials.appId,
          status: 'connected',
          verificationStatus: 'verified',
          lastVerified: new Date().toISOString()
        };
        localStorage.setItem('adPlatformConnections', JSON.stringify(connections));

        if (mounted) {
          setStatus('success');
          toast.success('Successfully connected to TikTok');
          
          setTimeout(() => {
            if (mounted) {
              navigate('/connections', { replace: true });
            }
          }, 2000);
        }
      } catch (error) {
        console.error('TikTok callback error:', error);
        const message = error instanceof Error ? error.message : 'Failed to authenticate with TikTok';
        
        if (mounted) {
          setErrorMessage(message);
          debug.error = error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : error;
          setStatus('error');
          toast.error(message);
        }
      } finally {
        if (mounted) {
          setDebugInfo(debug);
        }
      }
    };

    processCallback();

    return () => {
      mounted = false;
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
        <div className="text-center">
          {status === 'processing' && (
            <>
              <FaSpinner className="w-12 h-12 text-primary mx-auto animate-spin" />
              <h2 className="mt-4 text-xl font-semibold">Connecting to TikTok</h2>
              <p className="mt-2 text-gray-600">Please wait while we verify your account...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <FaCircleCheck className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold">Successfully Connected!</h2>
              <p className="mt-2 text-gray-600">
                Your TikTok account has been connected. Redirecting...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <FaCircleXmark className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold">Connection Failed</h2>
              <p className="mt-2 text-gray-600">{errorMessage}</p>
              <button
                onClick={() => navigate('/connections')}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
              >
                Back to Connections
              </button>
            </>
          )}
        </div>

        {debugInfo && (
          <div className="mt-8 border-t pt-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showDebug ? 'Hide' : 'Show'} Debug Information
            </button>
            
            {showDebug && (
              <pre className="mt-4 p-4 bg-gray-50 rounded-lg overflow-auto text-xs">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};