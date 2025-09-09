import { createContext, useEffect, useState, useContext } from "react";
import { apiRequest, API_ENDPOINTS, CURRENCIES, REFRESH_INTERVAL } from '../utils/api';

export const CoinContext = createContext();

export const useCoin = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoin must be used within a CoinContextProvider');
  }
  return context;
}; 

export const CoinContextProvider = (props) => {
  const [allCoin, setAllCoin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency, setCurrency] = useState(CURRENCIES.USD);
  const [globalData, setGlobalData] = useState(null);

  const fetchAllCoins = async () => {
    try {
      setError(null);
      const result = await apiRequest(
        API_ENDPOINTS.MARKETS(currency.name),
        'fetching all coins'
      );
      
      if (result.error) {
        setError(result.error);
      } else {
        setAllCoin(result || []);
      }
    } catch (err) {
      setError('Failed to fetch coin data');
      console.error('Error fetching coins:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalData = async () => {
    try {
      const result = await apiRequest(API_ENDPOINTS.GLOBAL, 'fetching global data');
      if (!result.error) {
        setGlobalData(result.data);
      }
    } catch (err) {
      console.error('Error fetching global data:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllCoins();
    fetchGlobalData();
    
    const interval = setInterval(() => {
      fetchAllCoins();
    }, REFRESH_INTERVAL);
    
    return () => clearInterval(interval);
  }, [currency]);

  const contextValue = {
    allCoin,
    loading,
    error,
    currency,
    setCurrency,
    globalData,
    refreshData: fetchAllCoins,
  };
  
  return (
    <CoinContext.Provider value={contextValue}>
      {props.children}
    </CoinContext.Provider>
  );
};

export default CoinContextProvider;
