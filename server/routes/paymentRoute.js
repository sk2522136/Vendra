import express from 'express';
import {createStripePaymentIntent,confirmStripePosPayment,} from '../controllers/paymentController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import tenantMiddleware from '../middleware/tenantMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js';

const router = express.Router();


router.post('/create-intent',authMiddleware,tenantMiddleware,wrapAsync(createStripePaymentIntent));

router.post('/confirm-stripe-payment',authMiddleware,tenantMiddleware,wrapAsync(confirmStripePosPayment));

export default router; 



