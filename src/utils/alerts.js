// Price alerts management utilities

export const getAlerts = () => {
  const alerts = localStorage.getItem('crypto-alerts');
  return alerts ? JSON.parse(alerts) : [];
};

export const saveAlerts = (alerts) => {
  localStorage.setItem('crypto-alerts', JSON.stringify(alerts));
};

export const addAlert = (coinId, coinName, targetPrice, condition = 'above') => {
  const alerts = getAlerts();
  const newAlert = {
    id: Date.now().toString(),
    coinId,
    coinName,
    targetPrice: parseFloat(targetPrice),
    condition, // 'above' or 'below'
    isActive: true,
    createdAt: new Date().toISOString(),
    triggeredAt: null
  };
  
  alerts.push(newAlert);
  saveAlerts(alerts);
  return newAlert;
};

export const removeAlert = (alertId) => {
  const alerts = getAlerts();
  const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
  saveAlerts(updatedAlerts);
  return updatedAlerts;
};

export const toggleAlert = (alertId) => {
  const alerts = getAlerts();
  const updatedAlerts = alerts.map(alert => 
    alert.id === alertId 
      ? { ...alert, isActive: !alert.isActive }
      : alert
  );
  saveAlerts(updatedAlerts);
  return updatedAlerts;
};

export const checkAlerts = (allCoins) => {
  const alerts = getAlerts();
  const triggeredAlerts = [];
  
  const updatedAlerts = alerts.map(alert => {
    if (!alert.isActive || alert.triggeredAt) return alert;
    
    const coin = allCoins.find(c => c.id === alert.coinId);
    if (!coin) return alert;
    
    const shouldTrigger = 
      (alert.condition === 'above' && coin.current_price >= alert.targetPrice) ||
      (alert.condition === 'below' && coin.current_price <= alert.targetPrice);
    
    if (shouldTrigger) {
      const triggeredAlert = {
        ...alert,
        triggeredAt: new Date().toISOString(),
        actualPrice: coin.current_price
      };
      
      triggeredAlerts.push(triggeredAlert);
      
      // Show notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Price Alert: ${alert.coinName}`, {
          body: `Price ${alert.condition} $${alert.targetPrice}. Current: $${coin.current_price.toFixed(2)}`,
          icon: coin.image
        });
      }
      
      return triggeredAlert;
    }
    
    return alert;
  });
  
  if (triggeredAlerts.length > 0) {
    saveAlerts(updatedAlerts);
  }
  
  return { updatedAlerts, triggeredAlerts };
};

export const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};
