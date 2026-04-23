import Joi from "joi";

// CATEGORY
export const categorySchema = Joi.object({
  name: Joi.string().required().trim(),
  isActive: Joi.boolean().optional()  
}).unknown(false);

// EXPENSE
export const expenseSchema = Joi.object({
  category: Joi.string()
    .valid('Salary', 'Rent', 'Utilities', 'Maintenance')
    .required(),
  amount: Joi.number().required(),
  description: Joi.string().required(),
  paymentMethod: Joi.string()
    .valid('Cash', 'Bank Transfer', 'Check')
    .required(),
  status: Joi.string().valid('pending', 'approved').optional()  
}).unknown(false);

// PRODUCT
export const productSchema = Joi.object({
  name: Joi.string().required(),
  sku: Joi.string().required(),
  category: Joi.string().required(),
  costPrice: Joi.number().required().positive(),
  quantity: Joi.number().required().min(0),
  description: Joi.string().required(),
  supplier: Joi.string().required(),
  unit: Joi.string()
    .valid('kg', 'Pcs', 'ltr')
    .required(),
  isActive: Joi.boolean().optional(),
     imageUrl: Joi.string().uri().optional()  // ← add karo

}).unknown(false);

// SALE - CREATE
export const createSaleSchema = Joi.object({
  name: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  items: Joi.array()
    .required()
    .min(1)
    .items(Joi.object({
      product: Joi.string().required(),
      quantity: Joi.number().required().positive(),
      sellPrice: Joi.number().required().positive()
    })),
  customerType: Joi.string().valid('cash', 'credit').required(),
  paidAmount: Joi.number().required().min(0)
}).unknown(false);

// SALE - UPDATE
export const updateSaleSchema = Joi.object({
   amountToPay: Joi.number().required().min(0)
}).unknown(false);

// SALE - RETURN
export const processReturnSchema = Joi.object({
  saleId: Joi.string().required(),
  productId: Joi.string().required(),
  quantity: Joi.number().required().positive().integer(),
  
}).unknown(false);

// SUPPLIER
export const supplierSchema = Joi.object({
    name: Joi.string().required(),
    contact: Joi.string().required(),
    isActive: Joi.boolean().optional()
}).unknown(false);

export const purchaseSchema = Joi.object({
    amount: Joi.number().positive().required()
}).unknown(false);

export const paymentSchema = Joi.object({
    amount: Joi.number().positive().required()
}).unknown(false);

// USER - LOGIN
export const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6)
}).unknown(false);

// USER - REGISTER
export const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
  role: Joi.string()
    .valid('admin', 'staff')
    .required(),
  isActive: Joi.boolean().optional() 
}).unknown(false);