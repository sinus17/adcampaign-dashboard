import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { CallbackProcessor } from './CallbackProcessor';

export const TikTokCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const navigate = useNavigate();

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
              <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="mt-4 text-xl font-semibold">Successfully Connected!</h2>
              <p className="mt-2 text-gray-600">
                Your TikTok account has been connected. Redirecting...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <FaExclamationCircle className="w-12 h-12 text-red-500 mx-auto" />
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

        <CallbackProcessor
          onSuccess={() => setStatus('success')}
          onError={(error) => {
            setStatus('error');
            setErrorMessage(error.message);
          }}
          onDebug={setDebugInfo}
        />

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