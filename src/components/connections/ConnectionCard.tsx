import React, { useState } from 'react';
import { FaFacebook, FaTiktok, FaGoogle, FaCalendarDays } from 'react-icons/fa6';
import { ApiForm, ApiFormData } from './ApiForm';
import { Modal } from '../shared/Modal';
import { verifyApiConnection, saveApiConfig } from '../../api/connections';
import { toast } from 'react-hot-toast';
import { TikTokAuthModal } from './TikTokAuthModal';
import { TikTokTokenModal } from './TikTokTokenModal';
import { TikTokCredentials } from '../../types/tiktok';

interface ConnectionCardProps {
  connection: {
    platform: 'meta' | 'tiktok' | 'google' | 'monday';
    status: 'connected' | 'error' | 'not_configured';
    lastSync: string | null;
    error?: string;
    apiKey?: string;
    apiSecret?: string;
    accountId?: string;
    refreshToken?: string;
    appId?: string;
    defaultBoardId?: string;
    workspaceId?: string;
    verificationStatus?: 'verified' | 'unverified' | 'pending';
  };
  onUpdateConnection: (platform: string, data: ApiFormData) => Promise<void>;
  onTestConnection: (platform: string) => Promise<void>;
}

const platformIcons = {
  meta: FaFacebook,
  tiktok: FaTiktok,
  google: FaGoogle,
  monday: FaCalendarDays
} as const;

const platformColors = {
  meta: 'text-primary',
  tiktok: 'text-primary',
  google: 'text-primary',
  monday: 'text-primary'
} as const;

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onUpdateConnection,
  onTestConnection
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [credentials, setCredentials] = useState<TikTokCredentials>({
    appId: '',
    clientSecret: '',
    redirectUri: window.location.origin + '/tiktok/callback'
  });
  const [isLoading, setIsLoading] = useState(false);
  const Icon = platformIcons[connection.platform];
  const iconColor = platformColors[connection.platform];

  const handleSubmit = async (data: ApiFormData) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (connection.platform === 'tiktok') {
        setCredentials({
          appId: data.appId || '',
          clientSecret: data.clientSecret || '',
          redirectUri: data.redirectUri || window.location.origin + '/tiktok/callback'
        });
        setIsAuthModalOpen(true);
        setIsSettingsOpen(false);
        return;
      }

      const apiConfig = {
        platform: connection.platform,
        ...data
      };

      const isValid = await verifyApiConnection(apiConfig);

      if (!isValid && connection.platform !== 'tiktok') {
        toast.error('Failed to verify connection');
        return;
      }

      await saveApiConfig(apiConfig);
      await onUpdateConnection(connection.platform, data);
      toast.success('Connection updated successfully');
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Failed to update connection:', error);
      toast.error('Failed to update connection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCode = (code: string) => {
    setAuthCode(code);
    setIsAuthModalOpen(false);
    setIsTokenModalOpen(true);
  };

  const handleTest = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      await onTestConnection(connection.platform);
      toast.success('Connection test successful');
    } catch (error) {
      console.error('Failed to test connection:', error);
      toast.error('Connection test failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary-50">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold capitalize">
              {connection.platform} {connection.platform !== 'monday' ? 'Ads' : ''}
            </h3>
            <p className="text-sm text-gray-500">
              {connection.lastSync 
                ? `Last synced: ${new Date(connection.lastSync).toLocaleString()}`
                : 'Not synced yet'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={handleTest}
              disabled={isLoading || connection.status === 'not_configured'}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Test Connection
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-600"
            >
              Configure
            </button>
          </div>
        </div>
      </div>

      {connection.error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
          {connection.error}
        </div>
      )}

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title={`Configure ${connection.platform} Connection`}
      >
        <ApiForm
          platform={connection.platform}
          onSubmit={handleSubmit}
          defaultValues={{
            apiKey: connection.apiKey,
            apiSecret: connection.apiSecret,
            accountId: connection.accountId,
            refreshToken: connection.refreshToken,
            appId: connection.appId,
            defaultBoardId: connection.defaultBoardId,
            workspaceId: connection.workspaceId,
          }}
          isLoading={isLoading}
        />
      </Modal>

      <TikTokAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthCode={handleAuthCode}
        defaultCredentials={credentials}
      />

      <TikTokTokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        authCode={authCode}
        credentials={credentials}
      />
    </div>
  );
};