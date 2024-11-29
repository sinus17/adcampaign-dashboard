export const TIKTOK_CONFIG = {
  API_BASE: 'https://business-api.tiktok.com/open_api/v1.3',
  AUTH_URL: 'https://business-api.tiktok.com/portal/auth',
  DEFAULT_TIMEOUT: 15000,
  SCOPES: ['user.info', 'ad.read', 'ad.write'],
  ENDPOINTS: {
    TOKEN: '/oauth2/access_token/',
    REFRESH: '/oauth2/refresh_token/',
    ADVERTISER: '/advertiser/info/',
    CAMPAIGN: {
      LIST: '/campaign/get/',
      STATS: '/campaign/stats/'
    }
  }
};