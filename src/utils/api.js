// API Configuration
import apiCache from './cache';

const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.coingecko.com/api/v3';
const DEBUG_API = import.meta.env.MODE === 'development' || import.meta.env.VITE_DEBUG_API === 'true';

// Add production debugging
if (import.meta.env.PROD) {
  console.log('🚀 Production API Configuration:');
  console.log('📍 Base URL:', BASE_URL);
  console.log('🔑 API Key configured:', !!API_KEY && API_KEY !== 'your_coingecko_api_key_here');
  console.log('🐛 Debug mode:', DEBUG_API);
}

// API Headers
const getHeaders = () => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  // Only add API key if it exists and is not empty
  if (API_KEY && API_KEY.trim() !== '' && API_KEY !== 'your_coingecko_api_key_here') {
    headers['x-cg-demo-api-key'] = API_KEY;
  }
  
  return headers;
};

// Error handling utility
export const handleApiError = (error, operation = 'API operation') => {
  // Always log in production for debugging
  if (import.meta.env.PROD || DEBUG_API) {
    console.error(`❌ Error during ${operation}:`, {
      name: error.name,
      message: error.message,
      status: error.status,
      stack: error.stack
    });
  }
  
  // Rate limiting (check first as it's most specific)
  if (error.status === 429) {
    return { error: 'Too many requests. Please wait a moment and try again.' };
  }
  
  // Authentication errors
  if (error.status === 401 || error.status === 403) {
    return { error: 'API access denied. Please try again later.' };
  }
  
  // Not found errors
  if (error.status === 404) {
    return { error: 'Requested data not found.' };
  }
  
  // Server errors
  if (error.status >= 500) {
    return { error: 'Service temporarily unavailable. Please try again.' };
  }
  
  // Bad request errors
  if (error.status >= 400) {
    return { error: `Request failed: ${error.message || 'Invalid request'}` };
  }
  
  // Network/connection errors (more specific checks)
  if (error.name === 'TypeError') {
    // CORS errors
    if (error.message.toLowerCase().includes('cors')) {
      return { error: 'Unable to access cryptocurrency data. Please try again.' };
    }
    
    // Network errors
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('fetch') ||
        error.message.includes('NetworkError')) {
      return { error: 'Unable to connect to data service. Please check your connection and try again.' };
    }
    
    // SSL/TLS errors
    if (error.message.toLowerCase().includes('ssl') || 
        error.message.toLowerCase().includes('certificate')) {
      return { error: 'Secure connection failed. Please try again.' };
    }
  }
  
  // DNS resolution errors
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return { error: 'Unable to reach cryptocurrency data service.' };
  }
  
  return { error: 'Service temporarily unavailable. Please try again.' };
};

// Request throttling to prevent rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests

// Generic fetch wrapper with error handling and caching
export const apiRequest = async (url, operation = 'request', useCache = true) => {
  // Check cache first
  if (useCache) {
    const cacheKey = apiCache.generateKey(url);
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      if (DEBUG_API) {
        console.log(`📦 Cache hit for ${operation}:`, url);
      }
      return cachedData;
    }
  }

  // Throttle requests to prevent rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  if (DEBUG_API || import.meta.env.PROD) {
    console.log(`🔄 Making API request for ${operation}:`, url);
    console.log('🔑 API Key present:', !!API_KEY && API_KEY !== 'your_coingecko_api_key_here');
    if (DEBUG_API) {
      console.log('📋 Headers:', getHeaders());
    }
  }

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutDuration = import.meta.env.PROD ? 15000 : 10000; // Longer timeout in production
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    // Enhanced fetch configuration for production
    const fetchConfig = {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal,
      // Add additional configurations for better reliability
      mode: 'cors',
      credentials: 'omit',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    };

    if (DEBUG_API || import.meta.env.PROD) {
      console.log('🚀 Fetch config:', {
        url,
        method: fetchConfig.method,
        mode: fetchConfig.mode,
        headers: Object.keys(fetchConfig.headers),
        timeout: timeoutDuration + 'ms'
      });
    }

    const response = await fetch(url, fetchConfig);
    
    clearTimeout(timeoutId);
    
    if (DEBUG_API) {
      console.log(`✅ Response status: ${response.status} for ${operation}`);
    }
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      
      // Try to get error details from response
      try {
        const errorData = await response.json();
        error.message = errorData.error || errorData.message || error.message;
        
        if (DEBUG_API) {
          console.error(`❌ API Error Response:`, errorData);
        }
      } catch {
        // Ignore JSON parsing errors for error responses
        if (DEBUG_API) {
          console.error(`❌ Could not parse error response for status ${response.status}`);
        }
      }
      
      throw error;
    }
    
    const data = await response.json();
    
    // Validate the response data
    if (!data) {
      throw new Error('Empty response received');
    }
    
    // Cache the successful response
    if (useCache) {
      const cacheKey = apiCache.generateKey(url);
      apiCache.set(cacheKey, data);
      console.log(`Cached response for ${operation}`);
    }
    
    return data;
  } catch (error) {
    // Handle timeout specifically
    if (error.name === 'AbortError') {
      return { error: 'Request timed out. Please try again.' };
    }
    
    console.error(`API request failed for ${operation}:`, error);
    return handleApiError(error, operation);
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  MARKETS: (currency) => `${BASE_URL}/coins/markets?vs_currency=${currency}`,
  COIN_DETAILS: (coinId) => `${BASE_URL}/coins/${coinId}`,
  COIN_SEARCH: (query) => `${BASE_URL}/search?query=${encodeURIComponent(query)}`,
  MARKET_CHART: (coinId, currency, days, interval = 'daily') => 
    `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=${interval}`,
  TRENDING: `${BASE_URL}/search/trending`,
  GLOBAL: `${BASE_URL}/global`,
};

// Helper function to find coin by search if direct lookup fails
export const findCoinBySearch = async (coinId) => {
  try {
    const searchResult = await apiRequest(API_ENDPOINTS.COIN_SEARCH(coinId), `searching for ${coinId}`);
    if (searchResult && searchResult.coins && searchResult.coins.length > 0) {
      // Find exact match first, otherwise return the first result
      const exactMatch = searchResult.coins.find(coin => 
        coin.id === coinId || 
        coin.symbol.toLowerCase() === coinId.toLowerCase() ||
        coin.name.toLowerCase() === coinId.toLowerCase()
      );
      return exactMatch || searchResult.coins[0];
    }
  } catch (error) {
    console.warn('Search fallback failed:', error);
  }
  return null;
};

// Constants
export const CURRENCIES = {
  USD: { name: 'usd', symbol: '$' },
  EUR: { name: 'eur', symbol: '€' },
  INR: { name: 'inr', symbol: '₹' },
};

export const CHART_PERIODS = {
  '1H': { days: 1, interval: 'hourly' },
  '4H': { days: 1, interval: 'hourly' },
  '1D': { days: 1, interval: 'hourly' },
  '7D': { days: 7, interval: 'hourly' },
  '30D': { days: 30, interval: 'daily' },
  '1Y': { days: 365, interval: 'daily' },
};

export const REFRESH_INTERVAL = parseInt(import.meta.env.VITE_REFRESH_INTERVAL) || 10000;

// API Test function for debugging
export const testApiConnection = async () => {
  console.log('🧪 Testing API connection...');
  
  try {
    // Test with a simple, lightweight endpoint
    const result = await apiRequest(
      `${BASE_URL}/ping`, 
      'API connectivity test',
      false // Don't cache test requests
    );
    
    if (result && !result.error) {
      console.log('✅ API connection successful');
      return true;
    } else {
      console.warn('⚠️ API ping failed, trying markets endpoint...');
      
      // Fallback test with markets endpoint
      const marketsResult = await apiRequest(
        API_ENDPOINTS.MARKETS('usd') + '&per_page=1',
        'API markets test',
        false
      );
      
      if (marketsResult && !marketsResult.error && Array.isArray(marketsResult)) {
        console.log('✅ API connection successful (via markets)');
        return true;
      }
    }
    
    console.error('❌ API connection failed');
    return false;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
};
