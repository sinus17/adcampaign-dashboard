export interface TikTokTokens {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: string;
}

export interface TikTokCredentials {
  appId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface TikTokConfig extends TikTokTokens {
  status: 'connected' | 'pending' | 'error';
  verificationStatus: 'verified' | 'unverified' | 'pending';
  lastVerified?: string;
  lastRefresh?: string;
}