import Payment from '../models/payment.js';
import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import SaleItem from '../models/SaleItem.js';
import Product from '../models/Product.js';
import ExpressError from '../utils/expressError.js';
import { createPaymentIntent, getPaymentStatus, createRefund } from '../utils/stripeService.js';
import generateReceipt from '../utils/receiptGenerator.js';
import { emitDashboardRefresh } from '../utils/emitDashboardRefresh.js';

// ===== 1. STRIPE PAYMENT INTENT CREATE =====
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

    // Sale find karo
    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new ExpressError('Sale not found', 404);
    }

    // Stripe payment intent create karo
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

// ===== 2. CONFIRM STRIPE PAYMENT =====
// POST /api/payment/confirm-stripe-payment
export const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId, saleId } = req.body;

    if (!paymentIntentId || !saleId) {
      throw new ExpressError('Payment intent ID and Sale ID required', 400);
    }

    // Stripe se payment status check karo
    const result = await getPaymentStatus(paymentIntentId);

    if (!result.success) {
      throw new ExpressError(result.error, 400);
    }

    const paymentStatus = result.status;

    // Sale find karo
    const sale = await Sale.findById(saleId).populate('customer').populate('items');
    if (!sale) {
      throw new ExpressError('Sale not found', 404);
    }

    // Agar payment succeed hua
    if (paymentStatus === 'succeeded') {
      const customer = sale.customer;

      // Payment record create karo
      const payment = await Payment.create({
        sale: saleId,
        customer: customer._id,
        amount: sale.totalAmount - sale.paidAmount,
        paymentMethod: 'card',
        paymentStatus: 'success',
        transactionId: paymentIntentId,
        recievedBy: req.user._id
      });

      // Sale update karo
      sale.paidAmount = sale.totalAmount;
      sale.paymentStatus = 'success';
      sale.paymentId = payment._id;
      sale.paymentMethod = 'card';
      await sale.save();

      // Customer lastPaymentDate update karo
      customer.lastPaymentDate = new Date();
      if (customer.customerType === 'credit') {
        customer.currentBalance = 0;
      }
      await customer.save();

      // Receipt generate karo
      let receiptNumber = `RCP-${Date.now()}`;
      sale.receiptNumber = receiptNumber;
      await sale.save();

      // Populate karo receipt generation ke liye
      const populatedSale = await Sale.findById(saleId)
        .populate('items')
        .populate('customer');

      // Items ke saath product details
      const itemsWithProducts = await Promise.all(
        populatedSale.items.map(async (item) => {
          const product = await Product.findById(item.product);
          return {
            productName: product.name,
            quantity: item.quantity,
            sellPrice: item.sellPrice,
            totalPrice: item.totalPrice
          };
        })
      );

      const receiptData = {
        receiptNumber: receiptNumber,
        customerName: customer.name,
        phoneNumber: customer.phoneNumber,
        customerType: customer.customerType,
        totalAmount: sale.totalAmount,
        paidAmount: sale.paidAmount,
        paymentMethod: 'card',
        items: itemsWithProducts,
        createdAt: sale.createdAt
      };

      try {
        await generateReceipt(receiptData, receiptNumber);
      } catch (pdfError) {
        console.error('Receipt generation error:', pdfError);
      }

      // Confirmation email bhejo
      try {
        await sendPaymentConfirmationEmail(
          customer.email || 'customer@email.com',
          customer.name,
          sale.totalAmount,
          paymentIntentId,
          receiptNumber
        );
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }

      emitDashboardRefresh();

      return res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully',
        data: {
          paymentStatus: 'success',
          receiptNumber: receiptNumber,
          totalAmount: sale.totalAmount
        }
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

