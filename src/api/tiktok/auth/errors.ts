import axios from 'axios';

export interface AuthErrorDetails {
  status?: number;
  statusText?: string;
  data?: any;
  url?: string;
  timestamp: string;
  endpoint?: string;
  requestData?: any;
}

export class AuthError extends Error {
  details: AuthErrorDetails;

  constructor(message: string, details: Partial<AuthErrorDetails> = {}) {
    super(message);
    this.name = 'AuthError';
    this.details = {
      ...details,
      timestamp: new Date().toISOString()
    };
  }
}

export const handleAuthError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    const config = error.config;
    
    console.error('API error details:', {
      status: response?.status,
      statusText: response?.statusText,
      data: response?.data,
      url: config?.url,
      method: config?.method,
      requestData: config?.data,
      timestamp: new Date().toISOString()
    });

    if (response) {
      const details: AuthErrorDetails = {
        status: response.status,
        statusText: response.statusText,
        url: config?.url,
        endpoint: config?.url?.split('/').slice(-2).join('/'),
        requestData: config?.data ? JSON.parse(config.data) : undefined,
        timestamp: new Date().toISOString()
      };

      try {
        const jsonData = typeof response.data === 'string' 
          ? JSON.parse(response.data)
          : response.data;
        
        details.data = jsonData;
        const apiError = jsonData.error?.message || jsonData.message || jsonData.error;
        
        throw new AuthError(apiError || 'Authentication failed', details);
      } catch (parseError) {
        if (response.status === 404) {
          throw new AuthError(
            'TikTok API endpoint not found. Please verify the API endpoint and your network connection.',
            details
          );
        }
        throw new AuthError(
          `TikTok API Error (${response.status}): ${response.statusText}`, 
          details
        );
      }
    }

    throw new AuthError('Network error while connecting to TikTok API', {
      url: config?.url,
      timestamp: new Date().toISOString()
    });
  }

  throw new AuthError(
    error instanceof Error ? error.message : 'Authentication failed',
    { timestamp: new Date().toISOString() }
  );
};