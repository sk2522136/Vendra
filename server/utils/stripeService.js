import 'dotenv/config';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Payment Intent create karne ke liye
export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe cents mein chahta hai
      currency: currency,
      metadata: metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Payment status check karne ke liye
export const getPaymentStatus = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: true,
      status: paymentIntent.status,
      paymentIntent: paymentIntent,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

// Refund create karne ke liye
export const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return {
      success: true,
      refundId: refund.id,
      refund: refund,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export default stripe;