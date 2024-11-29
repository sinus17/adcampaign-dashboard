import React from 'react';

interface DebugInfoProps {
  show: boolean;
  info: any;
  onToggle: () => void;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ show, info, onToggle }) => {
  if (!info) return null;

  return (
    <div className="mt-4">
      <button
        onClick={onToggle}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        {show ? 'Hide' : 'Show'} Debug Information
      </button>
      
      {show && (
        <pre className="mt-4 p-4 bg-gray-50 rounded-lg overflow-auto text-xs">
          {JSON.stringify(info, null, 2)}
        </pre>
      )}
    </div>
  );
};