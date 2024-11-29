import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { FaSpinner } from 'react-icons/fa6';
import { getTikTokAuthUrl } from '../../api/tiktok/auth/url';

interface TikTokAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthCode: (code: string) => void;
  defaultCredentials: {
    appId: string;
    clientSecret: string;
    redirectUri: string;
  };
}

export const TikTokAuthModal: React.FC<TikTokAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthCode,
  defaultCredentials
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authWindow, setAuthWindow] = useState<Window | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuthClick = () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!defaultCredentials.appId) {
        throw new Error('App ID is required');
      }

      const authUrl = getTikTokAuthUrl(defaultCredentials.appId, defaultCredentials.redirectUri);
      
      // Open TikTok auth in a popup window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const popup = window.open(
        authUrl,
        'TikTok Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (popup) {
        setAuthWindow(popup);
      } else {
        throw new Error('Failed to open authentication window');
      }

      // Check for auth code in the popup URL
      const checkPopup = setInterval(() => {
        try {
          if (!popup || popup.closed) {
            clearInterval(checkPopup);
            setIsLoading(false);
            setAuthWindow(null);
            return;
          }

          const currentUrl = popup.location.href;
          if (currentUrl.includes('auth_code=')) {
            clearInterval(checkPopup);
            const params = new URLSearchParams(new URL(currentUrl).search);
            const code = params.get('auth_code');
            if (code) {
              onAuthCode(code);
            }
            popup.close();
            setIsLoading(false);
          }
        } catch (error) {
          // Cross-origin errors are expected while the popup is on TikTok's domain
          if (error instanceof DOMException && error.name === 'SecurityError') {
            return;
          }
          console.error('Error checking popup:', error);
        }
      }, 500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {
      if (authWindow && !authWindow.closed) {
        authWindow.close();
      }
      onClose();
    }} title="TikTok Authentication - Step 1">
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <p className="text-sm text-gray-600">
            Using the following credentials:
          </p>
          <div className="space-y-1 text-sm">
            <p><strong>App ID:</strong> {defaultCredentials.appId || 'Not provided'}</p>
            <p><strong>Redirect URI:</strong> {defaultCredentials.redirectUri}</p>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAuthClick}
            disabled={isLoading || !defaultCredentials.appId}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {isLoading && <FaSpinner className="w-4 h-4 animate-spin" />}
            Connect with TikTok
          </button>
        </div>
      </div>
    </Modal>
  );
};