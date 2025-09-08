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
import chartService from '../../services/chartService';

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

const LineChart = memo(({ historicalData, timeFormat = 'day', timeDimension }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!historicalData?.prices || historicalData.prices.length === 0) {
      setChartData(null);
      return;
    }

    const labels = [];
    const data = [];

    historicalData.prices.forEach((item, index) => {
      const timestamp = item[0];
      const price = item[1];
      
      // Use enhanced time formatting from chart service
      const formattedTime = chartService.formatTimeLabel(timestamp, timeFormat);
      
      // For large datasets, show every nth label to avoid crowding
      const totalPoints = historicalData.prices.length;
      const skipInterval = Math.max(1, Math.ceil(totalPoints / 12)); // Show ~12 labels max
      
      if (totalPoints > 15 && index % skipInterval !== 0) {
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
  }, [historicalData, timeFormat]);

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
