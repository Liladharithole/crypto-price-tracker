// API Configuration
import apiCache from './cache';

const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.coingecko.com/api/v3';

// API Headers
const getHeaders = () => ({
  accept: 'application/json',
  'x-cg-demo-api-key': API_KEY,
}); 

// Error handling utility
export const handleApiError = (error, operation = 'API operation') => {
  console.error(`Error during ${operation}:`, error);
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return { error: 'Network error. Please check your internet connection.' };
  }
  
  if (error.status === 429) {
    return { error: 'Rate limit exceeded. Please try again later.' };
  }
  
  if (error.status >= 500) {
    return { error: 'Server error. Please try again later.' };
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
      return cachedData;
    }
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    
    const data = await response.json();
    
    // Cache the successful response
    if (useCache) {
      const cacheKey = apiCache.generateKey(url);
      apiCache.set(cacheKey, data);
    }
    
    return data;
  } catch (error) {
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
  '1H': { days: 1, interval: 'minutely', points: 60 },
  '4H': { days: 1, interval: 'hourly', points: 24 },
  '1D': { days: 1, interval: 'hourly', points: 24 },
  '7D': { days: 7, interval: 'hourly', points: 168 },
  '30D': { days: 30, interval: 'daily', points: 30 },
  '1Y': { days: 365, interval: 'daily', points: 365 },
};

export const REFRESH_INTERVAL = parseInt(import.meta.env.VITE_REFRESH_INTERVAL) || 10000;
