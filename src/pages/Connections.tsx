import React, { useState, useEffect } from 'react';
import { ConnectionCard } from '../components/connections/ConnectionCard';
import { ApiFormData } from '../components/connections/ApiForm';
import { toast } from 'react-hot-toast';

interface Connection {
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
}

function Connections() {
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    // Load saved connections from localStorage
    const savedConnections = JSON.parse(localStorage.getItem('adPlatformConnections') || '{}');
    
    const defaultConnections: Connection[] = [
      {
        platform: 'meta',
        status: savedConnections.meta ? 'connected' : 'not_configured',
        lastSync: savedConnections.meta?.lastVerified || null,
        apiKey: savedConnections.meta?.apiKey,
        accountId: savedConnections.meta?.accountId,
        verificationStatus: savedConnections.meta?.verificationStatus || 'unverified'
      },
      {
        platform: 'tiktok',
        status: savedConnections.tiktok ? 'connected' : 'not_configured',
        lastSync: savedConnections.tiktok?.lastVerified || null,
        appId: savedConnections.tiktok?.appId,
        apiSecret: savedConnections.tiktok?.apiSecret,
        verificationStatus: savedConnections.tiktok?.verificationStatus || 'unverified'
      },
      {
        platform: 'google',
        status: savedConnections.google ? 'connected' : 'not_configured',
        lastSync: savedConnections.google?.lastVerified || null,
        apiKey: savedConnections.google?.apiKey,
        apiSecret: savedConnections.google?.apiSecret,
        refreshToken: savedConnections.google?.refreshToken,
        verificationStatus: savedConnections.google?.verificationStatus || 'unverified'
      },
      {
        platform: 'monday',
        status: savedConnections.monday ? 'connected' : 'not_configured',
        lastSync: savedConnections.monday?.lastVerified || null,
        apiKey: savedConnections.monday?.apiKey,
        defaultBoardId: savedConnections.monday?.defaultBoardId,
        workspaceId: savedConnections.monday?.workspaceId,
        verificationStatus: savedConnections.monday?.verificationStatus || 'unverified'
      }
    ];

    setConnections(defaultConnections);
  }, []);

  const handleUpdateConnection = async (platform: string, data: ApiFormData) => {
    const updatedConnections = connections.map(conn => {
      if (conn.platform === platform) {
        return {
          ...conn,
          ...data,
          status: 'connected',
          error: undefined,
          lastSync: new Date().toISOString(),
          verificationStatus: 'verified'
        };
      }
      return conn;
    });

    setConnections(updatedConnections);
    toast.success('Connection updated successfully');
  };

  const handleTestConnection = async (platform: string) => {
    const connection = connections.find(conn => conn.platform === platform);
    if (!connection) return;

    try {
      const updatedConnections = connections.map(conn => {
        if (conn.platform === platform) {
          return {
            ...conn,
            status: 'connected',
            error: undefined,
            lastSync: new Date().toISOString(),
            verificationStatus: 'verified'
          };
        }
        return conn;
      });

      setConnections(updatedConnections);
      toast.success('Connection test successful');
    } catch (error) {
      toast.error('Connection test failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Platform Connections</h2>
      </div>

      <div className="grid gap-6">
        {connections.map((connection) => (
          <ConnectionCard
            key={connection.platform}
            connection={connection}
            onUpdateConnection={handleUpdateConnection}
            onTestConnection={handleTestConnection}
          />
        ))}
      </div>
    </div>
  );
}

export default Connections;