
export const saveToLocalStorage = (key, data) => {
  try {
    const jsonString = JSON.stringify(data);
    localStorage.setItem(key, jsonString);
  } catch (error) {
    console.error('❌ LocalStorage save failed:', error);
  }
};

export const getFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ LocalStorage read failed:', error);
    return null;
  }
};

export const clearLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('❌ LocalStorage clear failed:', error);
  }
};

// SAVE SALE 
export const saveSaleToLocalStorage = (saleData) => {
  const sales = getFromLocalStorage('pos_sales') || [];
  sales.push({
    ...saleData,
    savedAt: new Date().toISOString(),
    syncStatus: 'synced'
  });
  saveToLocalStorage('pos_sales', sales);
};

//  SAVE PAYMENT 
export const savePaymentToLocalStorage = (paymentData) => {
  const payments = getFromLocalStorage('pos_payments') || [];
  payments.push({
    ...paymentData,
    savedAt: new Date().toISOString(),
    syncStatus: 'synced'
  });
  saveToLocalStorage('pos_payments', payments);
};

// GET SALES 
export const getAllSalesFromLocalStorage = () => {
  return getFromLocalStorage('pos_sales') || [];
};

//  GET PAYMENTS
export const getAllPaymentsFromLocalStorage = () => {
  return getFromLocalStorage('pos_payments') || [];
};

// STATS 
export const getLocalStorageStats = () => {
  const sales = getAllSalesFromLocalStorage();
  const payments = getAllPaymentsFromLocalStorage();

  return {
    totalSales: sales.length,
    totalPayments: payments.length,
    totalStorageUsed: new Blob([JSON.stringify({ sales, payments })]).size,
    lastUpdated: new Date().toISOString()
  };
};