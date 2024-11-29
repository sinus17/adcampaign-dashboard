import { Handler } from '@netlify/functions';
import axios from 'axios';

const TIKTOK_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { app_id, auth_code, client_secret, redirect_uri, grant_type } = JSON.parse(event.body || '{}');

    if (!auth_code || !app_id || !client_secret || !redirect_uri) {
      console.error('Missing parameters:', {
        hasAuthCode: !!auth_code,
        hasAppId: !!app_id,
        hasClientSecret: !!client_secret,
        hasRedirectUri: !!redirect_uri,
        timestamp: new Date().toISOString()
      });
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    const tokenUrl = `${TIKTOK_API_BASE}/oauth2/access_token/`;
    
    console.log('Token exchange request:', {
      url: tokenUrl,
      appId: app_id,
      authCodePrefix: auth_code.substring(0, 10) + '...',
      redirectUri: redirect_uri,
      timestamp: new Date().toISOString()
    });

    const response = await axios.post(tokenUrl, {
      app_id,
      secret: client_secret,
      auth_code,
      grant_type: grant_type || 'authorization_code',
      redirect_uri
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    console.log('TikTok API response:', {
      status: response.status,
      hasData: !!response.data,
      hasToken: !!response.data?.data?.access_token,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Token exchange error:', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString()
    });
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.message || error.message;
      
      console.error('TikTok API error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        requestData: error.config?.data
      });

      return {
        statusCode: status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Token exchange failed',
          message,
          details: {
            status,
            data: error.response?.data,
            endpoint: error.config?.url
          }
        })
      };
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };