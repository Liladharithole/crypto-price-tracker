import React, { useEffect, useState, useCallback } from "react";
import "./Coin.css";
import { useParams } from "react-router-dom";
import { useCoin } from "../../context/CoinContext";
import LineChart from "../../components/LineChart/LineChart";
import Loading from "../../components/Loading/Loading";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";
import ChartSkeleton from "../../components/ChartSkeleton/ChartSkeleton";
import { apiRequest, API_ENDPOINTS, CHART_PERIODS } from "../../utils/api";
import { addAlert } from "../../utils/alerts";

const Coin = () => {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [timeFormat, setTimeFormat] = useState('day');
  const [timeDimension, setTimeDimension] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('1D');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState('above');
  const { currency } = useCoin();

  // Fetch Coin Data
  const fetchCoinData = async () => {
    try {
      setError(null);
      
      // Validate coinId before making request
      if (!coinId || coinId.trim() === '') {
        setError('Invalid coin identifier');
        return;
      }
      
      const result = await apiRequest(
        API_ENDPOINTS.COIN_DETAILS(coinId),
        `fetching ${coinId} details`
      );
      
      if (result.error) {
        setError(result.error);
      } else if (!result || !result.id) {
        setError('Invalid coin data received');
      } else {
        setCoinData(result);
        console.log('Coin data loaded successfully:', result.name);
      }
    } catch (err) {
      setError('Failed to fetch coin data');
      console.error('Error fetching coin data:', err);
    }
  };

  // Fetch historical data with standard API
  const fetchHistoricalData = useCallback(async (period = '1D', showLoading = true) => {
    try {
      if (showLoading) {
        setChartLoading(true);
      }
      
      // Validate inputs
      if (!coinId || !currency.name) {
        console.error('Missing coinId or currency for chart data');
        return;
      }
      
      const periodConfig = CHART_PERIODS[period] || CHART_PERIODS['7D'];
      const result = await apiRequest(
        API_ENDPOINTS.MARKET_CHART(coinId, currency.name, periodConfig.days, periodConfig.interval),
        `fetching ${period} chart data for ${coinId}`,
        true
      );
      
      if (result && !result.error) {
        if (result.prices && Array.isArray(result.prices) && result.prices.length > 0) {
          setHistoricalData(result);
          console.log(`Chart data loaded for ${period}:`, result.prices.length, 'data points');
        } else {
          console.warn('Empty or invalid chart data received:', result);
        }
      } else {
        console.error('Chart data error:', result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error fetching historical data:', err);
    } finally {
      if (showLoading) {
        setChartLoading(false);
      }
    }
  }, [coinId, currency.name]);

  // Handle chart period change with optimistic UI
  const handlePeriodChange = useCallback((period) => {
    // Instantly update the UI
    setChartPeriod(period);
    
    // Then fetch new data
    fetchHistoricalData(period, true);
  }, [fetchHistoricalData]);

  // Handle price alert creation
  const handleAddAlert = () => {
    if (!alertPrice || !coinData) return;
    
    try {
      addAlert(coinId, coinData.name, parseFloat(alertPrice), alertCondition);
      alert(`Price alert set for ${coinData.name} when price goes ${alertCondition} ${currency.symbol}${alertPrice}`);
      setAlertPrice('');
    } catch (err) {
      alert('Failed to set price alert');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setChartLoading(true);
      
      // Fetch coin data first (it's usually faster)
      const coinPromise = fetchCoinData();
      
      // Start chart data fetch immediately after
      const chartPromise = fetchHistoricalData(chartPeriod, false);
      
      // Wait for coin data first to show basic info quickly
      await coinPromise;
      setLoading(false); // Show coin info immediately
      
      // Then wait for chart data
      await chartPromise;
      setChartLoading(false);
      
      // Preload common chart periods in background (don't show loading)
      setTimeout(() => {
        const commonPeriods = ['1D', '7D'];
        commonPeriods.forEach(period => {
          if (period !== chartPeriod) {
            fetchHistoricalData(period, false);
          }
        });
      }, 2000); // Wait 2 seconds before preloading
    };
    
    if (coinId) {
      fetchData();
    }
  }, [coinId, currency, chartPeriod, fetchHistoricalData]);

  // Loading state
  if (loading) {
    return (
      <div className="coin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading {coinId} details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="coin">
        <ErrorDisplay 
          message={error} 
          onRetry={() => {
            setLoading(true);
            fetchCoinData().finally(() => setLoading(false));
          }}
          type="error"
        />
      </div>
    );
  }

  // No data state
  if (!coinData) {
    return (
      <div className="coin">
        <ErrorDisplay 
          message="Coin data not found" 
          showRetry={false}
          type="warning"
        />
      </div>
    );
  }

  const currentPrice = coinData.market_data?.current_price?.[currency.name];
  const priceChange24h = coinData.market_data?.price_change_percentage_24h || 0;
  const marketCap = coinData.market_data?.market_cap?.[currency.name];
  const volume24h = coinData.market_data?.total_volume?.[currency.name];
  const high24h = coinData.market_data?.high_24h?.[currency.name];
  const low24h = coinData.market_data?.low_24h?.[currency.name];

  return (
    <div className="coin fade-in">
      {/* Coin Header */}
      <div className="coin-header">
        <div className="coin-title">
          <img src={coinData.image?.large} alt={coinData.name} className="coin-logo" />
          <div className="coin-name-section">
            <h1 className="coin-name">
              {coinData.name} 
              <span className="coin-symbol">({coinData.symbol?.toUpperCase()})</span>
            </h1>
            <div className="coin-rank">
              Rank #{coinData.market_cap_rank || 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="coin-price-section">
          <div className="current-price">
            {currency.symbol}{currentPrice?.toLocaleString() || 'N/A'}
          </div>
          <div className={`price-change-24h ${
            priceChange24h >= 0 ? 'positive' : 'negative'
          }`}>
            {priceChange24h >= 0 ? '↗' : '↘'} {Math.abs(priceChange24h).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Price Alert Section */}
      <div className="price-alert-section">
        <h3>Set Price Alert</h3>
        <div className="alert-controls">
          <select 
            value={alertCondition} 
            onChange={(e) => setAlertCondition(e.target.value)}
            className="alert-condition"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
          <input
            type="number"
            placeholder={`Price in ${currency.symbol}`}
            value={alertPrice}
            onChange={(e) => setAlertPrice(e.target.value)}
            className="alert-price-input"
            step="0.01"
          />
          <button 
            onClick={handleAddAlert} 
            className="alert-btn"
            disabled={!alertPrice}
          >
            Set Alert
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="coin-chart-section">
        <div className="chart-header">
          <h3>Price Chart</h3>
          <div className="chart-period-selector">
            {Object.keys(CHART_PERIODS).map((period) => (
              <button
                key={period}
                className={`period-btn ${
                  chartPeriod === period ? 'active' : ''
                }`}
                onClick={() => handlePeriodChange(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        <div className="coin-chart">
          {chartLoading ? (
            <ChartSkeleton />
          ) : historicalData && historicalData.prices ? (
            <LineChart historicalData={historicalData} />
          ) : (
            <div className="chart-error">
              <p>No chart data available</p>
              <small>Try selecting a different time period</small>
            </div>
          )}
        </div>
      </div>

      {/* Coin Statistics */}
      <div className="coin-stats">
        <h3>Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Market Cap</div>
            <div className="stat-value">
              {currency.symbol}{marketCap?.toLocaleString() || 'N/A'}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">24h Volume</div>
            <div className="stat-value">
              {currency.symbol}{volume24h?.toLocaleString() || 'N/A'}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">24h High</div>
            <div className="stat-value positive">
              {currency.symbol}{high24h?.toLocaleString() || 'N/A'}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">24h Low</div>
            <div className="stat-value negative">
              {currency.symbol}{low24h?.toLocaleString() || 'N/A'}
            </div>
          </div>
          
          {coinData.market_data?.circulating_supply && (
            <div className="stat-card">
              <div className="stat-label">Circulating Supply</div>
              <div className="stat-value">
                {coinData.market_data.circulating_supply.toLocaleString()} {coinData.symbol?.toUpperCase()}
              </div>
            </div>
          )}
          
          {coinData.market_data?.max_supply && (
            <div className="stat-card">
              <div className="stat-label">Max Supply</div>
              <div className="stat-value">
                {coinData.market_data.max_supply.toLocaleString()} {coinData.symbol?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Description */}
      {coinData.description?.en && (
        <div className="coin-description">
          <h3>About {coinData.name}</h3>
          <div 
            className="description-text"
            dangerouslySetInnerHTML={{
              __html: coinData.description.en.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Coin;
