import React, { useEffect, useState, memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = memo(({ historicalData }) => {
  const [chartData, setChartData] = useState(null);

  // Simple time formatting function
  const formatTimeLabel = (timestamp, dataLength) => {
    const date = new Date(timestamp);
    
    if (dataLength <= 24) {
      // Hourly data - show time
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    } else if (dataLength <= 168) {
      // Weekly data - show day and time
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit'
      });
    } else {
      // Monthly/yearly data - show date
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  useEffect(() => {
    if (!historicalData?.prices || historicalData.prices.length === 0) {
      setChartData(null);
      return;
    }

    const labels = [];
    const data = [];
    const dataLength = historicalData.prices.length;

    historicalData.prices.forEach((item, index) => {
      const timestamp = item[0];
      const price = item[1];
      
      // Use simple time formatting
      const formattedTime = formatTimeLabel(timestamp, dataLength);
      
      // For large datasets, show every nth label to avoid crowding
      const skipInterval = Math.max(1, Math.ceil(dataLength / 8)); // Show ~8 labels max
      
      if (dataLength > 10 && index % skipInterval !== 0) {
        labels.push('');
      } else {
        labels.push(formattedTime);
      }
      
      data.push(price);
    });

    setChartData({
      labels,
      datasets: [
        {
          label: 'Price',
          data,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderWidth: 3,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#007bff',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    });
  }, [historicalData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#007bff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Price: $${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  if (!chartData) {
    return (
      <div style={{
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        No chart data available
      </div>
    );
  }

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
});

LineChart.displayName = 'LineChart';

export default LineChart;
