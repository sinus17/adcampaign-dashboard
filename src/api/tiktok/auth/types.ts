export interface AuthState {
  value: string;
  timestamp: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: string;
}

export interface TokenExchangeParams {
  appId: string;
  clientSecret: string;
  redirectUri: string;
}