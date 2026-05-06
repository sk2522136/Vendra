import axios from 'axios';

const API = axios.create({ 
    baseURL: 'http://localhost:4000/api',
    withCredentials:true,
});

// Authenticatin routes
export const login = (data)=> API.post('/auth/login',data);
export const logout = ()=>API.post('/auth/logout');
export const registerStaff = (data)=>API.post('/auth/register',data)
export const isAuth = ()=>API.get('/auth/is-auth')
export const getAllStaff = () => API.get('/auth/staff'); // 👈 یہ backend mein banani padegi


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
export const fetchSales = ()=> API.get('/sale')
export const createSale = (data)=> API.post('/sale/create',data)
export const getSaleByCustomer = (id)=> API.get(`/sale/customer/${id}`)
export const updateSale = (id, data) => API.put(`/sale/${id}`, data)
export const getSaleById = (id)=>API.get(`/sale/${id}`)
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



export default API;