import React, { useState } from 'react';

interface ErrorDisplayProps {
  error: string;
  debugInfo: any;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, debugInfo }) => {
  const [showDebug, setShowDebug] = useState(false);

  return (
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
  );
};