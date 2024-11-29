import { Handler } from '@netlify/functions';
import axios from 'axios';

const TIKTOK_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { refreshToken, appId, clientSecret } = JSON.parse(event.body || '{}');

    if (!refreshToken || !appId || !clientSecret) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    const response = await axios.post(`${TIKTOK_API_BASE}/oauth2/refresh_token/`, {
      app_id: appId,
      secret: clientSecret,
      refresh_token: refreshToken
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        statusCode: error.response?.status || 500,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: error.response?.data?.message || 'Failed to refresh token',
          details: error.response?.data
        })
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };