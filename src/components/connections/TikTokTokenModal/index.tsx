import React from 'react';
import { Modal } from '../../shared/Modal';
import { TokenExchange } from './TokenExchange';
import { TikTokCredentials } from '../../../types/tiktok';

interface TikTokTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExchangeToken: (code: string, credentials: TikTokCredentials) => Promise<void>;
  authCode: string;
  credentials: TikTokCredentials;
}

export const TikTokTokenModal: React.FC<TikTokTokenModalProps> = ({
  isOpen,
  onClose,
  onExchangeToken,
  authCode,
  credentials
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="TikTok Authentication - Step 2">
      <TokenExchange
        authCode={authCode}
        credentials={credentials}
        onExchangeToken={onExchangeToken}
        onClose={onClose}
      />
    </Modal>
  );
};