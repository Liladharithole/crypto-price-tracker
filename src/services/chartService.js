import moment from 'moment';
import { apiRequest, API_ENDPOINTS } from '../utils/api';

class ChartService {
  constructor() {
    this.cache = new Map();
  }

  // Generate synthetic minute data from hourly data
  generateMinuteData(hourlyData, hours = 1) {
    if (!hourlyData || hourlyData.length < 2) return [];
    
    const minuteData = [];
    const totalMinutes = hours * 60;
    const now = new Date();
    
    // Get the last two hourly prices to interpolate
    const latestPrice = hourlyData[hourlyData.length - 1][1];
    const previousPrice = hourlyData.length > 1 ? hourlyData[hourlyData.length - 2][1] : latestPrice;
    
    // Generate minute-by-minute data with some realistic volatility
    for (let i = totalMinutes; i >= 0; i--) {
      const timestamp = moment(now).subtract(i, 'minutes').valueOf();
      
      // Create price variation with some randomness
      const progress = (totalMinutes - i) / totalMinutes;
      const basePrice = previousPrice + (latestPrice - previousPrice) * progress;
      
      // Add some realistic volatility (±0.5%)
      const volatility = (Math.random() - 0.5) * 0.01 * basePrice;
      const price = Math.max(0, basePrice + volatility);
      
      minuteData.push([timestamp, price]);
    }
    
    return minuteData;
  }

  // Generate synthetic hourly data with more variation
  generateHourlyData(dailyData, hours = 24) {
    if (!dailyData || dailyData.length < 2) return [];
    
    const hourlyData = [];
    const now = new Date();
    
    // Get base price trend
    const latestPrice = dailyData[dailyData.length - 1][1];
    const previousPrice = dailyData.length > 1 ? dailyData[dailyData.length - 2][1] : latestPrice;
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = moment(now).subtract(i, 'hours').valueOf();
      
      // Create more varied hourly data
      const progress = (hours - i) / hours;
      const trendPrice = previousPrice + (latestPrice - previousPrice) * progress;
      
      // Add hourly volatility (±2%)
      const hourlyVolatility = (Math.random() - 0.5) * 0.04 * trendPrice;
      
      // Add some cyclical patterns (simulating trading patterns)
      const hourOfDay = moment(timestamp).hour();
      const cyclicalFactor = 1 + 0.02 * Math.sin((hourOfDay / 24) * 2 * Math.PI);
      
      const price = Math.max(0, (trendPrice + hourlyVolatility) * cyclicalFactor);
      hourlyData.push([timestamp, price]);
    }
    
    return hourlyData;
  }

  async fetchChartData(coinId, currency, period) {
    const cacheKey = `${coinId}_${currency}_${period}`;
    
    try {
      switch (period) {
        case '1H':
          // For 1H, we need to simulate minute data
          const hourlyBase = await apiRequest(
            API_ENDPOINTS.MARKET_CHART(coinId, currency, 1, 'hourly')
          );
          
          if (hourlyBase?.prices) {
            return {
              prices: this.generateMinuteData(hourlyBase.prices, 1),
              timeFormat: 'minute'
            };
          }
          break;

        case '4H':
          // For 4H, we need detailed hourly data
          const fourHourBase = await apiRequest(
            API_ENDPOINTS.MARKET_CHART(coinId, currency, 1, 'hourly')
          );
          
          if (fourHourBase?.prices) {
            return {
              prices: this.generateHourlyData(fourHourBase.prices, 4),
              timeFormat: 'hour'
            };
          }
          break;

        case '1D':
          // For 1D, get hourly data for the last day
          const oneDayData = await apiRequest(
            API_ENDPOINTS.MARKET_CHART(coinId, currency, 1, 'hourly')
          );
          
          if (oneDayData?.prices) {
            return {
              prices: this.generateHourlyData(oneDayData.prices, 24),
              timeFormat: 'hour'
            };
          }
          break;

        case '7D':
          // For 7D, get daily data with hourly interpolation
          const weekData = await apiRequest(
            API_ENDPOINTS.MARKET_CHART(coinId, currency, 7, 'hourly')
          );
          
          if (weekData?.prices) {
            // Sample every 4 hours for 7 days (42 points)
            const sampledData = weekData.prices.filter((_, index) => index % 4 === 0);
            return {
              prices: sampledData,
              timeFormat: 'day'
            };
          }
          break;

        case '30D':
          // For 30D, get daily data
          const monthData = await apiRequest(
            API_ENDPOINTS.MARKET_CHART(coinId, currency, 30, 'daily')
          );
          
          if (monthData?.prices) {
            return {
              prices: monthData.prices,
              timeFormat: 'day'
            };
          }
          break;

        case '1Y':
          // For 1Y, get weekly data
          const yearData = await apiRequest(
            API_ENDPOINTS.MARKET_CHART(coinId, currency, 365, 'daily')
          );
          
          if (yearData?.prices) {
            // Sample every 7 days for yearly view (52 points)
            const sampledData = yearData.prices.filter((_, index) => index % 7 === 0);
            return {
              prices: sampledData,
              timeFormat: 'month'
            };
          }
          break;

        default:
          const defaultData = await apiRequest(
            API_ENDPOINTS.MARKET_CHART(coinId, currency, 7, 'daily')
          );
          return {
            prices: defaultData?.prices || [],
            timeFormat: 'day'
          };
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      return { prices: [], timeFormat: 'day' };
    }

    return { prices: [], timeFormat: 'day' };
  }

  // Format time labels based on the time format
  formatTimeLabel(timestamp, timeFormat) {
    const date = moment(timestamp);
    
    switch (timeFormat) {
      case 'minute':
        return date.format('HH:mm');
      case 'hour':
        return date.format('MMM D, HH:mm');
      case 'day':
        return date.format('MMM D');
      case 'month':
        return date.format('MMM YYYY');
      default:
        return date.format('MMM D');
    }
  }

  // Get time dimension info for display
  getTimeDimension(timeFormat, dataLength) {
    const info = {
      minute: {
        unit: 'minutes',
        interval: '1 min',
        total: `${dataLength} minutes`,
        description: 'Last hour with 1-minute intervals'
      },
      hour: {
        unit: 'hours',
        interval: '1 hour',
        total: `${dataLength} hours`,
        description: 'Hourly price movements'
      },
      day: {
        unit: 'days',
        interval: '1 day',
        total: `${dataLength} days`,
        description: 'Daily price movements'
      },
      month: {
        unit: 'months',
        interval: '1 week',
        total: `${Math.round(dataLength / 4)} weeks`,
        description: 'Weekly price averages'
      }
    };

    return info[timeFormat] || info.day;
  }
}

export default new ChartService();
