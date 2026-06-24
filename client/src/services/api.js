import axios from 'axios';

const API = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true, 
});

let isRefreshing = false; // ✅ Global flag
let failedQueue = []; // ✅ Queue pending requests

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

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // ❌ SKIP THESE ENDPOINTS - ye refresh nahi karega
    if (
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/refresh') ||
      originalRequest.url.includes('/auth/is-auth') // ✅ YE BHI ADD KAR
    ) {
      return Promise.reject(err);
    }

    // ✅ 401 error aaya
    if (err.response?.status === 401 && !originalRequest._retry) {
      // ✅ Agar already refresh chal raha hai
      if (isRefreshing) {
        // Wait karo refresh complete hone tak
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // ✅ Refresh start karo
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await API.post('/auth/refresh');
        processQueue(null, response.data);
        return API(originalRequest); // ✅ Retry karo
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);


// Authenticatin routes
export const login = (data)=> API.post('/auth/login',data);
export const logout = ()=>API.post('/auth/logout');
export const registerStaff = (data)=>API.post('/auth/register',data)
export const isAuth = ()=>API.get('/auth/is-auth')
export const getAllStaff = () => API.get('/auth/staff'); 
export const deleteStaff = (id) => API.delete(`/auth/staff/${id}`);



// Product routes
export const createProduct = (formData)=> API.post('/product/create',formData);
export const fetchProduct = (params) =>API.get('/product', { params });
export const updateProduct = (id,formData)=> API.put(`/product/${id}`,formData )
export const deleteProduct = (id)=> API.delete(`/product/${id}`)
export const getProductById = (id)=>API.get(`/product/${id}`)
export const getProductsByCategory = (id)=>API.get(`/product/category/${id}`)


//categories route
export const getAllCategories = () => API.get('/category');
export const createCategory = (data) =>API.post('/category/create', data);
export const updateCategory = (id, data) =>API.put(`/category/${id}`, data);
export const deleteCategory = (id) =>API.delete(`/category/${id}`);

// sales route
export const createSale = (data)=> API.post('/sale/create',data)
export const getSaleByCustomer = (id)=> API.get(`/sale/customer/${id}`)
export const updateSale = (id, data) => API.put(`/sale/${id}`, data)
export const deleteSale = (id )=> API.delete(`/sale/${id}`)
export const processReturn = (id, data) => API.post(`/sale/${id}/return`, data);

// customer route
export const getAllCustomers = (params) =>API.get('/customer', { params });

// inventory route
export const getInventoryStatus = () =>API.get('/inventory/status');
export const getInventoryHistory = (productId) =>API.get(`/inventory/history/${productId}`);

// supplier route
export const getAllSuppliers = () =>API.get('/supplier');
export const createSupplier = (data) =>API.post('/supplier/create', data);
export const getSupplierById = (id) =>API.get(`/supplier/${id}`);
export const updateSupplier = (id, data) =>API.put(`/supplier/${id}`, data);
export const deleteSupplier = (id) =>API.delete(`/supplier/${id}`);
export const addPurchase = (id, data) =>API.post(`/supplier/${id}/purchase`, data);
export const addPayment = (id, data) =>API.post(`/supplier/${id}/payment`, data);

// expense route
export const createExpense = (data) =>API.post('/expense/create', data);
export const getExpenses = (params) =>API.get('/expense/list', { params });

//analytical Route
export const getSaleChart = (month, year) =>API.get(`/analytical/sale?month=${month || ''}&year=${year || ''}`);
export const getTopSellProducts = (month, year, limit = 10) =>API.get(`/analytical/products?month=${month || ''}&year=${year || ''}&limit=${limit}`);
export const getProfitChart = (year) =>API.get(`/analytical/profit?year=${year || ''}`);
export const getPaymentMethod = (month, year) =>API.get(`/analytical/payment?month=${month || ''}&year=${year || ''}`);


// payment route
export const createStripeIntent = (data) => API.post('/payment/create-intent', data);
export const confirmStripePayment = (data) => API.post('/payment/confirm-stripe-payment', data);

//chatbot route
export const getChatbotResponse = (data) => API.post('/chatbot/message',  data );
export default API;