import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';
import './CryptoChart.css';

const CryptoChart = ({ 
  data, 
  period = '7D', 
  currency = { symbol: '$', name: 'usd' },
  loading = false 
}) => {
  const chartData = useMemo(() => {
    if (!data || !data.prices || data.prices.length === 0) {
      return [];
    }

    return data.prices.map(([timestamp, price]) => ({
      timestamp,
      price: parseFloat(price.toFixed(8)),
      date: new Date(timestamp),
      formattedTime: formatTimeByPeriod(timestamp, period)
    }));
  }, [data, period]);

  const formatTimeByPeriod = (timestamp, period) => {
    const date = new Date(timestamp);
    
    switch (period) {
      case '1H':
        return format(date, 'HH:mm');
      case '4H':
        return format(date, 'HH:mm');
      case '1D':
        return format(date, 'HH:mm');
      case '7D':
        return format(date, 'MMM dd');
      case '30D':
        return format(date, 'MMM dd');
      case '1Y':
        return format(date, 'MMM yyyy');
      default:
        return format(date, 'MMM dd');
    }
  };

  const formatTooltipValue = (value, name) => {
    return [`${currency.symbol}${parseFloat(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    })}`, 'Price'];
  };

  const formatTooltipLabel = (label, payload) => {
    if (payload && payload[0] && payload[0].payload) {
      const date = payload[0].payload.date;
      switch (period) {
        case '1H':
        case '4H':
          return format(date, 'MMM dd, yyyy HH:mm');
        case '1D':
          return format(date, 'MMM dd, yyyy HH:mm');
        case '7D':
        case '30D':
          return format(date, 'MMM dd, yyyy');
        case '1Y':
          return format(date, 'MMM dd, yyyy');
        default:
          return format(date, 'MMM dd, yyyy');
      }
    }
    return label;
  };

  const formatYAxisTick = (value) => {
    if (value >= 1000000) {
      return `${currency.symbol}${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${currency.symbol}${(value / 1000).toFixed(1)}K`;
    } else if (value >= 1) {
      return `${currency.symbol}${value.toFixed(0)}`;
    } else {
      return `${currency.symbol}${value.toFixed(4)}`;
    }
  };

  const getGradientId = () => `colorPrice_${Math.random().toString(36).substr(2, 9)}`;
  const gradientId = useMemo(() => getGradientId(), []);

  // Calculate price change for gradient color
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    const firstPrice = chartData[0].price;
    const lastPrice = chartData[chartData.length - 1].price;
    return lastPrice - firstPrice;
  }, [chartData]);

  const isPositive = priceChange >= 0;
  const strokeColor = isPositive ? '#00d4aa' : '#ff6b6b';
  const gradientColor = isPositive ? '#00d4aa' : '#ff6b6b';

  if (loading) {
    return (
      <div className="crypto-chart-container">
        <div className="chart-loading">
          <div className="loading-spinner"></div>
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="crypto-chart-container">
        <div className="chart-error">
          <p>No chart data available</p>
          <small>Try selecting a different time period</small>
        </div>
      </div>
    );
  }

  const tickCount = Math.min(chartData.length, 8);
  const dataInterval = Math.max(Math.floor(chartData.length / tickCount), 1);

  return (
    <div className="crypto-chart-container">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.1)"
            vertical={false}
          />
          <XAxis
            dataKey="formattedTime"
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: '#888', 
              fontSize: 12,
              fontWeight: 500
            }}
            interval={dataInterval}
            minTickGap={20}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ 
              fill: '#888', 
              fontSize: 12,
              fontWeight: 500
            }}
            tickFormatter={formatYAxisTick}
            domain={['auto', 'auto']}
            width={80}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="custom-tooltip">
                    <p className="tooltip-label">{formatTooltipLabel(label, payload)}</p>
                    <p className="tooltip-price">
                      <span className="price-label">Price: </span>
                      <span className={`price-value ${isPositive ? 'positive' : 'negative'}`}>
                        {formatTooltipValue(payload[0].value)[0]}
                      </span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ 
              r: 6, 
              stroke: strokeColor,
              strokeWidth: 2,
              fill: '#ffffff'
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="chart-info">
        <div className="chart-stats">
          <div className="stat-item">
            <span className="stat-label">Data Points:</span>
            <span className="stat-value">{chartData.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Period:</span>
            <span className="stat-value">{period}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Change:</span>
            <span className={`stat-value ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{((priceChange / chartData[0]?.price) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoChart;
