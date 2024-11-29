import axios, { AxiosRequestConfig } from 'axios';
import fetch from 'cross-fetch';
import { toast } from 'react-hot-toast';

const PROXY_CONFIGS = [
  {
    name: 'cors.io',
    url: 'https://corsproxy.io/?',
    transform: (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`
  },
  {
    name: 'allorigins',
    url: 'https://api.allorigins.win/raw?url=',
    transform: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  },
  {
    name: 'corsanywhere',
    url: 'https://cors-anywhere.herokuapp.com/',
    transform: (url: string) => `https://cors-anywhere.herokuapp.com/${url}`
  }
];

export const tryProxies = async <T>(
  url: string, 
  config: AxiosRequestConfig = {}
): Promise<T> => {
  let lastError: Error | null = null;

  // First try direct request with fetch
  try {
    console.log('Trying direct request...');
    const response = await fetch(url, {
      method: config.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: config.data ? JSON.stringify(config.data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Direct request successful:', {
      status: response.status,
      hasData: !!data
    });
    return data;
  } catch (error) {
    console.log('Direct request failed:', error);
    lastError = error as Error;
  }

  // Try each proxy in sequence
  for (const proxy of PROXY_CONFIGS) {
    try {
      console.log(`Trying proxy: ${proxy.name}`);
      const proxyUrl = proxy.transform(url);
      
      const response = await axios({
        ...config,
        url: proxyUrl,
        headers: {
          ...config.headers,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log(`${proxy.name} request successful:`, {
        status: response.status,
        hasData: !!response.data
      });
      return response.data;
    } catch (error) {
      console.error(`${proxy.name} request failed:`, error);
      lastError = error as Error;
      continue;
    }
  }

  // If all attempts failed, throw the last error
  throw lastError || new Error('All proxy attempts failed');
};