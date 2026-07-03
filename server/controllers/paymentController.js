import Payment from '../models/payment.js';
import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import SaleItem from '../models/SaleItem.js';
import Product from '../models/Product.js';
import ExpressError from '../utils/expressError.js';
import { createPaymentIntent, getPaymentStatus } from '../utils/stripeService.js';
import generateReceipt from '../utils/receiptGenerator.js';
import { emitDashboardRefresh } from '../utils/emitDashboardRefresh.js';
import { generateAndGetReceiptPDF, prepareReceiptPayload } from '../utils/receiptService.js';
import fs from "fs";


// POST /api/payment/create-intent
export const createStripePaymentIntent = async (req, res) => {
  try {
    const { amount, saleId, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      throw new ExpressError('Invalid amount', 400);
    }

    if (!saleId) {
      throw new ExpressError('Sale ID required', 400);
    }

    // Sale find
    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new ExpressError('Sale not found', 404);
    }

    // Stripe payment intent create 
    const result = await createPaymentIntent(amount, currency, {
      saleId: saleId.toString(),
    });

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

// POST /api/payment/confirm-stripe-payment
// POST /api/payment/confirm-stripe-payment
export const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId, saleId } = req.body;

    if (!paymentIntentId || !saleId) {
      throw new ExpressError('Payment intent ID and Sale ID required', 400);
    }

    // Stripe payment status check 
    const result = await getPaymentStatus(paymentIntentId);

    if (!result.success) {
      throw new ExpressError(result.error, 400);
    }

    const paymentStatus = result.status;

    // Sale find
    const sale = await Sale.findById(saleId).populate('customer').populate('items');
    if (!sale) {
      throw new ExpressError('Sale not found', 404);
    }

    // payment succeed 
    if (paymentStatus === 'succeeded') {
      const customer = sale.customer;

      // Calculate actual paid amount correctly
      const amountPaidThisTurn = sale.totalAmount - sale.paidAmount;

      // Payment record create
      const payment = await Payment.create({
        sale: saleId,
        customer: customer._id,
        amount: amountPaidThisTurn,
        paymentMethod: 'card',
        paymentStatus: 'success',
        transactionId: paymentIntentId,
        recievedBy: req.user._id
      });

      // Sale update 
      let receiptNumber = `RCP-${Date.now()}`;
      sale.paidAmount = sale.totalAmount;
      sale.paymentStatus = 'success';
      sale.paymentId = payment._id;
      sale.paymentMethod = 'card';
      sale.receiptNumber = receiptNumber;
      await sale.save();

      // Update customer correctly
      customer.totalPaid += Number(amountPaidThisTurn);
      customer.lastPaymentDate = new Date();
      
      if (customer.customerType === 'credit') {
        customer.currentBalance = Math.max(0, customer.currentBalance - amountPaidThisTurn);
      }
      await customer.save();

      // Populate items with products safely
      const populatedSale = await Sale.findById(saleId).populate('items');

      // 🔥 BUG FIX #1: Added safety check (?.) so that code never crashes if product is missing
      const itemsWithProducts = await Promise.all(
        populatedSale.items.map(async (item) => {
          const product = await Product.findById(item.product);
          return {
            productName: product ? product.name : 'Unknown Product',
            quantity: item.quantity,
            sellPrice: item.sellPrice,
            totalPrice: item.totalPrice
          };
        })
      );

      // ✅ Reusable payload helper use karein jo aapki service mein hai
      const receiptPayload = prepareReceiptPayload(
        populatedSale,
        customer,
        itemsWithProducts,
        receiptNumber,
        'card'
      );

      // 🔥 BUG FIX #2: Generate PDF and get Base64 string to send to frontend
      let pdfBase64Data = null;
      let receiptFileName = "";
      
      try {
        const receiptResult = await generateAndGetReceiptPDF(receiptPayload, receiptNumber);
        if (receiptResult.success) {
          pdfBase64Data = receiptResult.pdfBase64;
          receiptFileName = receiptResult.fileName;
        }
      } catch (pdfError) {
        console.error('Receipt generation error:', pdfError);
      }

      if (typeof emitDashboardRefresh === 'function') {
        emitDashboardRefresh();
      }

      // ✅ EXACT MATCH WITH CASH/CREDIT RESPONSE STRUCTURE
      return res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        sale,
        pdfData: pdfBase64Data,   // ← Ab frontend ko direct yeh base64 milega screen par render karne ke liye
        fileName: receiptFileName
      });
    }

    // Agar payment processing mein hai
    if (paymentStatus === 'processing') {
      return res.status(200).json({
        success: true,
        message: 'Payment is being processed',
        paymentStatus: 'processing'
      });
    }

    // Agar payment failed
    throw new ExpressError('Payment failed. Please try again.', 400);

  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};


