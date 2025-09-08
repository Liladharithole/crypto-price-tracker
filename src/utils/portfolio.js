// Portfolio management utilities

export const getPortfolio = () => {
  const portfolio = localStorage.getItem('crypto-portfolio');
  return portfolio ? JSON.parse(portfolio) : {};
};

export const savePortfolio = (portfolio) => {
  localStorage.setItem('crypto-portfolio', JSON.stringify(portfolio));
};
 
export const addToPortfolio = (coinId, amount, price) => {
  const portfolio = getPortfolio();
  const existing = portfolio[coinId];
  
  if (existing) {
    // Calculate weighted average price
    const totalAmount = existing.amount + amount;
    const totalValue = (existing.amount * existing.avgPrice) + (amount * price);
    portfolio[coinId] = {
      amount: totalAmount,
      avgPrice: totalValue / totalAmount,
      lastUpdated: new Date().toISOString()
    };
  } else {
    portfolio[coinId] = {
      amount,
      avgPrice: price,
      lastUpdated: new Date().toISOString()
    };
  }
  
  savePortfolio(portfolio);
  return portfolio;
};

export const removeFromPortfolio = (coinId, amount) => {
  const portfolio = getPortfolio();
  
  if (portfolio[coinId]) {
    if (amount >= portfolio[coinId].amount) {
      delete portfolio[coinId];
    } else {
      portfolio[coinId].amount -= amount;
      portfolio[coinId].lastUpdated = new Date().toISOString();
    }
    savePortfolio(portfolio);
  }
  
  return portfolio;
};

export const calculatePortfolioValue = (portfolio, allCoins) => {
  let totalValue = 0;
  let totalInvested = 0;
  
  Object.entries(portfolio).forEach(([coinId, holding]) => {
    const coin = allCoins.find(c => c.id === coinId);
    if (coin) {
      const currentValue = holding.amount * coin.current_price;
      const investedValue = holding.amount * holding.avgPrice;
      
      totalValue += currentValue;
      totalInvested += investedValue;
    }
  });
  
  const profitLoss = totalValue - totalInvested;
  const profitLossPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
  
  return {
    totalValue,
    totalInvested,
    profitLoss,
    profitLossPercentage
  };
};
