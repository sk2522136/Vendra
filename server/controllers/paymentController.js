import Payment from '../models/Payment.js';
import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import SaleItem from '../models/SaleItem.js';
import Product from '../models/Product.js';
import ExpressError from '../utils/expressError.js';
import { createPaymentIntent, getPaymentStatus } from '../utils/stripeService.js';
import { emitDashboardRefresh } from '../utils/emitDashboardRefresh.js';
import { generateAndGetReceiptPDF, prepareReceiptPayload } from '../utils/receiptService.js';

// 1. POST /api/payment/create-intent
export const createStripePaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      throw new ExpressError('Invalid amount', 400);
    }

    // Stripe payment intent create 
    const result = await createPaymentIntent(amount, currency);

    if (!result.success) {
      throw new ExpressError(result.error, 400);
    }

    res.status(200).json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      message: 'Payment intent created successfully'
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

export const confirmStripePosPayment = async (req, res) => {
  const { paymentIntentId, saleData } = req.body;
  const { tenantId, user } = req;

  if (!paymentIntentId || !saleData) {
    throw new ExpressError('Payment intent ID and Sale details are required', 400);
  }

  //  Verify Stripe Status
  const stripe = await getPaymentStatus(paymentIntentId);
  if (!stripe.success || stripe.status !== 'succeeded') {
    throw new ExpressError('Stripe payment verification failed', 400);
  }

  //  Create Sale Items
  let subtotal = 0;
  const itemIds = [];
  const receiptItems = [];

  for (const item of (saleData.items || [])) {
    const price = Number(item.sellPrice || 0);
    const qty = Number(item.quantity || 1);
    const lineTotal = price * qty;
    const productId = item.productId || item.product;

    subtotal += lineTotal;

    const saleItem = await SaleItem.create({
      tenantId,
      product: productId,
      quantity: qty,
      sellPrice: price,
      totalPrice: lineTotal
    });

    itemIds.push(saleItem._id);

    let name = item.productName || 'Product';
    if (!item.productName && productId) {
      const prod = await Product.findOne({ _id: productId, tenantId });
      if (prod) name = prod.name;
    }

    receiptItems.push({ productName: name, quantity: qty, sellPrice: price, totalPrice: lineTotal });
  }

  // Totals Calculation
  const discount = Number(saleData.discount || 0);
  const totalAmount = Math.max(0, subtotal - discount);
  const paidAmount = Number(saleData.paidAmount ?? totalAmount);
  const receiptNo = `RCP-${Date.now()}`;

  // Resolve Customer
  let customer = null;
  if (saleData.phoneNumber) {
    customer = await Customer.findOne({ phoneNumber: saleData.phoneNumber, tenantId });
  }

  if (!customer && (saleData.name || saleData.phoneNumber)) {
    customer = new Customer({
      tenantId,
      name: saleData.name || 'Walk-in Customer',
      phoneNumber: saleData.phoneNumber || '',
      currentBalance: 0,
      customerType: 'card',
      totalPurchased: 0,
      totalPaid: 0
    });
    await customer.save();
  }

  //  Create Sale Record
  const sale = await Sale.create({
    tenantId,
    items: itemIds,
    customer: customer ? customer._id : null,
    totalAmount,
    paidAmount,
    discount,
    paymentMethod: 'card',
    paymentStatus: 'success',
    receiptNumber: receiptNo,
    createdBy: user?._id || null
  });

  await SaleItem.updateMany(
  { _id: { $in: itemIds } },
  { $set: { saleRef: sale._id } }
);

  // Create Payment Record
  const payment = await Payment.create({
    tenantId,
    sale: sale._id,
    customer: customer ? customer._id : null,
    amount: totalAmount,
    paymentMethod: 'card',
    paymentStatus: 'success',
    transactionId: paymentIntentId,
    stripePaymentIntentId: paymentIntentId,
    recievedBy: user?._id || null
  });

  sale.paymentId = payment._id;
  await sale.save();

  //  Update
  if (customer) {
    customer.totalPurchased = (customer.totalPurchased || 0) + totalAmount;
    customer.totalPaid = (customer.totalPaid || 0) + paidAmount;
    customer.currentBalance = Math.max(0, customer.totalPurchased - customer.totalPaid);
    customer.lastPaymentDate = new Date();
    await customer.save();
  }

  //  PDF Generation
  let pdfData = null;
  let fileName = '';
  try {
    const custInfo = customer || { name: saleData.name || 'Walk-in Customer', phoneNumber: saleData.phoneNumber || '' };
    const payload = prepareReceiptPayload(sale, custInfo, receiptItems, receiptNo, 'card');
    const pdf = await generateAndGetReceiptPDF(payload, receiptNo);

    if (pdf?.success) {
      pdfData = pdf.pdfBase64;
      fileName = pdf.fileName;
    }
  } catch (pdfErr) {
    console.error('PDF Generation Error:', pdfErr);
  }

  if (typeof emitDashboardRefresh === 'function') {
    emitDashboardRefresh();
  }

  return res.status(200).json({
    success: true,
    message: 'Payment confirmed and sale saved successfully',
    sale,
    pdfData,
    fileName
  });
};