// ===== LOCALSTORAGE SERVICE FOR REAL-TIME SYNC =====

export const saveToLocalStorage = (key, data) => {
  try {
    const jsonString = JSON.stringify(data);
    localStorage.setItem(key, jsonString);
    console.log('✅ LocalStorage saved:', key);
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
    console.log('✅ LocalStorage cleared:', key);
  } catch (error) {
    console.error('❌ LocalStorage clear failed:', error);
  }
};

// ===== SAVE SALE (REAL-TIME) =====
export const saveSaleToLocalStorage = (saleData) => {
  const sales = getFromLocalStorage('pos_sales') || [];
  sales.push({
    ...saleData,
    savedAt: new Date().toISOString(),
    syncStatus: 'synced'
  });
  saveToLocalStorage('pos_sales', sales);
  console.log('💾 Sale saved to LocalStorage');
};

// ===== SAVE PAYMENT (REAL-TIME) =====
export const savePaymentToLocalStorage = (paymentData) => {
  const payments = getFromLocalStorage('pos_payments') || [];
  payments.push({
    ...paymentData,
    savedAt: new Date().toISOString(),
    syncStatus: 'synced'
  });
  saveToLocalStorage('pos_payments', payments);
  console.log('💳 Payment saved to LocalStorage');
};

// ===== GET SALES =====
export const getAllSalesFromLocalStorage = () => {
  return getFromLocalStorage('pos_sales') || [];
};

// ===== GET PAYMENTS =====
export const getAllPaymentsFromLocalStorage = () => {
  return getFromLocalStorage('pos_payments') || [];
};

// ===== STATS =====
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