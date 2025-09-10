// API Configuration
import apiCache from './cache';

const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.coingecko.com/api/v3';

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
  console.error(`Error during ${operation}:`, error);
  
  // Network/connection errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return { error: 'Network error. Please check your internet connection.' };
  }
  
  // CORS errors
  if (error.name === 'TypeError' && error.message.includes('cors')) {
    return { error: 'Unable to connect to CoinGecko API. Please try again later.' };
  }
  
  // Rate limiting
  if (error.status === 429) {
    return { error: 'Rate limit exceeded. Please try again in a few minutes.' };
  }
  
  // Authentication errors
  if (error.status === 401 || error.status === 403) {
    return { error: 'API authentication error. Please check your API key.' };
  }
  
  // Not found errors
  if (error.status === 404) {
    return { error: 'Requested cryptocurrency data not found.' };
  }
  
  // Server errors
  if (error.status >= 500) {
    return { error: 'CoinGecko server error. Please try again later.' };
  }
  
  // Bad request errors
  if (error.status >= 400) {
    return { error: `Invalid request: ${error.message || 'Bad request'}` };
  }
  
  return { error: 'Something went wrong. Please try again.' };
};

// Generic fetch wrapper with error handling and caching
export const apiRequest = async (url, operation = 'request', useCache = true) => {
  // Check cache first
  if (useCache) {
    const cacheKey = apiCache.generateKey(url);
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for ${operation}:`, url);
      return cachedData;
    }
  }

  console.log(`Making API request for ${operation}:`, url);

  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      
      // Try to get error details from response
      try {
        const errorData = await response.json();
        error.message = errorData.error || error.message;
      } catch {
        // Ignore JSON parsing errors for error responses
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
  MARKET_CHART: (coinId, currency, days, interval = 'daily') => 
    `${BASE_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}&interval=${interval}`,
  TRENDING: `${BASE_URL}/search/trending`,
  GLOBAL: `${BASE_URL}/global`,
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
