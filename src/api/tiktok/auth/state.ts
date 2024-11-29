import { nanoid } from 'nanoid';
import { encryptData, decryptData } from '../../../utils/encryption';

const STATE_STORAGE_KEY = 'tiktokAuthState';
const STATE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface StateData {
  value: string;
  timestamp: number;
}

export const generateAuthState = (): string => {
  const state = nanoid();
  const stateData: StateData = {
    value: state,
    timestamp: Date.now()
  };
  localStorage.setItem(STATE_STORAGE_KEY, encryptData(JSON.stringify(stateData)));
  return state;
};

export const validateState = (state: string): boolean => {
  try {
    const encryptedState = localStorage.getItem(STATE_STORAGE_KEY);
    if (!encryptedState) return false;

    const decryptedData = decryptData(encryptedState);
    const stateData: StateData = JSON.parse(decryptedData);
    
    const isValid = (
      stateData.value === state &&
      Date.now() - stateData.timestamp < STATE_EXPIRY
    );

    localStorage.removeItem(STATE_STORAGE_KEY);
    return isValid;
  } catch (error) {
    console.error('State validation error:', error);
    return false;
  }
};