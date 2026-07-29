import Payment from '../models/Payment.js';
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
    const tenantId = req.tenantId;

    if (!amount || amount <= 0) {
      throw new ExpressError('Invalid amount', 400);
    }

    if (!saleId) {
      throw new ExpressError('Sale ID required', 400);
    }

    // Sale find
    const sale = await Sale.findOne({ _id: saleId, tenantId});
    
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
export const confirmStripePosPayment = async (req, res) => {
  try {
    const { paymentIntentId, saleId } = req.body;
    const tenantId = req.tenantId

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
    const sale = await Sale.findOne({
    _id: saleId,
    tenantId 
  }).populate('customer')
    .populate('items');
    
    if (!sale) {
      throw new ExpressError('Sale not found', 404);
    }

    // payment succeed 
    if (paymentStatus === 'succeeded') {
      const customer = sale.customer;

      const amountPaidThisTurn = sale.totalAmount - sale.paidAmount;

      const payment = await Payment.create({
        tenantId:tenantId,
        sale: saleId,
        customer: customer._id,
        amount: amountPaidThisTurn,
        paymentMethod: 'card',
        paymentStatus: 'success',
        transactionId: paymentIntentId,
        recievedBy: req.user._id
      });

      let receiptNumber = `RCP-${Date.now()}`;
      sale.paidAmount = sale.totalAmount;
      sale.paymentStatus = 'success';
      sale.paymentId = payment._id;
      sale.paymentMethod = 'card';
      sale.receiptNumber = receiptNumber;
      await sale.save();

      customer.totalPaid += Number(amountPaidThisTurn);
      customer.lastPaymentDate = new Date();
      
      if (customer.customerType === 'credit') {
        customer.currentBalance = Math.max(0, customer.currentBalance - amountPaidThisTurn);
      }
      await customer.save();

      const populatedSale = await Sale.Sale.findOne({ _id: saleId,tenantId }).populate('items');

      const itemsWithProducts = await Promise.all(
        populatedSale.items.map(async (item) => {
          const product = await Product.findOne({_id: item.product,tenantId});
          return {
            productName: product ? product.name : 'Unknown Product',
            quantity: item.quantity,
            sellPrice: item.sellPrice,
            totalPrice: item.totalPrice
          };
        })
      );

      const receiptPayload = prepareReceiptPayload(
        populatedSale,
        customer,
        itemsWithProducts,
        receiptNumber,
        'card'
      );

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

      return res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        sale,
        pdfData: pdfBase64Data,   
        fileName: receiptFileName
      });
    }

    if (paymentStatus === 'processing') {
      return res.status(200).json({
        success: true,
        message: 'Payment is being processed',
        paymentStatus: 'processing'
      });
    }

    throw new ExpressError('Payment failed. Please try again.', 400);

  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};


