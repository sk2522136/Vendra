import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Attach Token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle Refresh Token 
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    //  not trigger
    const authEndpointsToBypass = [
      '/auth/login',
      '/auth/signup',
      '/auth/register',
      '/auth/refresh',
      '/auth/is-auth'
    ];

    const isBypassUrl = authEndpointsToBypass.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    if (isBypassUrl) {
      return Promise.reject(err);
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && typeof token === 'string') {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await API.post('/auth/refresh');
        const newToken = response.data?.accessToken || response.data;

        if (typeof newToken === 'string') {
          localStorage.setItem('token', newToken);
        }

        processQueue(null, newToken);
        return API(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token'); // Clear token on failure
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

// --- Authentication routes ---
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const logout = () => API.post('/auth/logout');
export const registerStaff = (data) => API.post('/auth/register', data);
export const isAuth = () => API.get('/auth/is-auth');
export const getAllStaff = () => API.get('/auth/staff');
export const deleteStaff = (id) => API.delete(`/auth/staff/${id}`);

// --- Product routes ---
export const createProduct = (formData) => API.post('/product/create', formData);
export const fetchProduct = (params) => API.get('/product', { params });
export const updateProduct = (id, formData) => API.put(`/product/${id}`, formData);
export const deleteProduct = (id) => API.delete(`/product/${id}?hard=true`);
export const getProductById = (id) => API.get(`/product/${id}`);
export const getProductsByCategory = (id) => API.get(`/product/category/${id}`);

// --- Category routes ---
export const getAllCategories = () => API.get('/category');
export const createCategory = (data) => API.post('/category/create', data);
export const updateCategory = (id, data) => API.put(`/category/${id}`, data);
export const deleteCategory = (id) => API.delete(`/category/${id}`);

// --- Sales routes ---
export const createSale = (data) => API.post('/sale/create', data);
export const getSaleByCustomer = (id) => API.get(`/sale/customer/${id}`);
export const updateSale = (id, data) => API.put(`/sale/${id}`, data);
export const deleteSale = (id) => API.delete(`/sale/${id}`);
export const processReturn = (id, data) => API.post(`/sale/${id}/return`, data);

// --- Customer routes ---
export const getAllCustomers = (params) => API.get('/customer', { params });

// --- Inventory routes ---
export const getInventoryStatus = () => API.get('/inventory/status');
export const getInventoryHistory = (productId) => API.get(`/inventory/history/${productId}`);

// --- Supplier routes ---
export const getAllSuppliers = () => API.get('/supplier');
export const createSupplier = (data) => API.post('/supplier/create', data);
export const getSupplierById = (id) => API.get(`/supplier/${id}`);
export const updateSupplier = (id, data) => API.put(`/supplier/${id}`, data);
export const deleteSupplier = (id) => API.delete(`/supplier/${id}`);
export const addPurchase = (id, data) => API.post(`/supplier/${id}/purchase`, data);
export const addPayment = (id, data) => API.post(`/supplier/${id}/payment`, data);

// --- Expense routes ---
export const createExpense = (data) => API.post('/expense/create', data);
export const getExpenses = (params) => API.get('/expense/list', { params });

// --- Analytical routes ---
export const getSaleChart = (month, year) => API.get(`/analytical/sale?month=${month || ''}&year=${year || ''}`);
export const getTopSellProducts = (month, year, limit = 10) => API.get(`/analytical/products?month=${month || ''}&year=${year || ''}&limit=${limit}`);
export const getProfitChart = (year) => API.get(`/analytical/profit?year=${year || ''}`);
export const getPaymentMethod = (month, year) => API.get(`/analytical/payment?month=${month || ''}&year=${year || ''}`);

// --- Payment routes ---
export const createStripeIntent = (data) => API.post('/payment/create-intent', data);
export const confirmStripePosPayment = (data) => API.post('/payment/confirm-stripe-payment', data);

// --- Chatbot route ---
export const getChatbotResponse = (data) => API.post('/chatbot/message', data);

// --- Voice route ---
export const parseVoiceCommand = (data) => API.post('/voice/parse-command', data);

// --- Backup routes ---
export const downloadBackup = () => API.get('/backup/download', { responseType: 'blob' });
export const restoreBackup = (data) => API.post('/backup/restore', data);
export const getBackupStatus = () => API.get('/backup/status');

// --- Pricing / Subscription routes ---
export const getPricingPlans = () => API.get('/billing/plans');
export const createSubscription = (data) => API.post('/billing/subscribe', data);
export const upgradeSubscription = (newPlanId) => API.put('/billing/upgrade', { newPlanId });
export const cancelSubscription = () => API.delete('/billing/cancel');
export const getSubscriptionStatus = () => API.get('/billing/status');
export const confirmStripePayment = (sessionId) => API.post('/billing/confirm-payment', { sessionId });

// --- Super Admin routes ---
export const getSuperAdminStats = () => API.get('/super-admin/stats');
export const getAllTenants = (params) => API.get('/super-admin/tenants', { params });
export const toggleTenantStatus = (id, status) => API.patch(`/super-admin/tenants/${id}/status`, { status });
export const updateTenantPlan = (id, subscriptionPlan) => API.patch(`/super-admin/tenants/${id}/plan`, { subscriptionPlan });
export const getRevenueAnalytics = () => API.get('/super-admin/revenue');

export default API;