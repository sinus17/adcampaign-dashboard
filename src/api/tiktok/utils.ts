import { encryptData, decryptData } from '../../utils/encryption';

export const generateState = (): string => {
  const state = Math.random().toString(36).substring(7);
  const encryptedState = encryptData(state);
  localStorage.setItem('tiktokAuthState', encryptedState);
  return state;
};

export const validateState = (state: string): boolean => {
  const encryptedState = localStorage.getItem('tiktokAuthState');
  if (!encryptedState) return false;
  
  const savedState = decryptData(encryptedState);
  return state === savedState;
};

export const logApiResponse = (response: any, context: string) => {
  console.log(`${context} response:`, {
    status: response?.status,
    hasData: !!response?.data,
    hasToken: !!response?.data?.data?.access_token,
    timestamp: new Date().toISOString()
  });
};

export const logApiError = (error: unknown, context: string) => {
  console.error(`${context} error:`, {
    error: error instanceof Error ? error.message : 'Unknown error',
    timestamp: new Date().toISOString()
  });
};