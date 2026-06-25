import express from 'express';
import {createStripePaymentIntent,confirmStripePayment,} from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js';

const router = express.Router();


router.post('/create-intent',authMiddleware,wrapAsync(createStripePaymentIntent));

router.post('/confirm-stripe-payment',authMiddleware,wrapAsync(confirmStripePayment));

export default router; 



