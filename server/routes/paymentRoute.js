import express from 'express';
import {
  createStripePaymentIntent,
  confirmStripePayment,
  
} from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js';

const router = express.Router();

// ===== STRIPE PAYMENT ROUTES =====

// 1. Stripe payment intent create karo
router.post(
  '/create-intent',
  authMiddleware,
  wrapAsync(createStripePaymentIntent)
);

// 2. Stripe payment confirm karo
router.post(
  '/confirm-stripe-payment',
  authMiddleware,
  wrapAsync(confirmStripePayment)
);

export default router; 



