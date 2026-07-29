import express from 'express';
import authMiddleware from '../Middleware/authMiddleware.js';
import tenantMiddleware from '../Middleware/tenantMiddleware.js';
import {getAllPlans,createSubscription,upgradeSubscription,cancelSubscription,getSubscriptionStatus,confirmStripePayment,handleStripeWebhook} from '../Controllers/pricingController.js';
import wrapAsync from '../utils/wrapAsync.js';


const router = express.Router();

router.get('/plans', getAllPlans);

router.post('/subscribe', authMiddleware, tenantMiddleware, wrapAsync(createSubscription));

router.post('/confirm-payment', authMiddleware, tenantMiddleware, wrapAsync(confirmStripePayment));

router.put('/upgrade', authMiddleware, tenantMiddleware,wrapAsync (upgradeSubscription));

router.delete('/cancel', authMiddleware, tenantMiddleware,wrapAsync (cancelSubscription));

router.get('/status', authMiddleware, tenantMiddleware, wrapAsync (getSubscriptionStatus));

router.post('/webhook', authMiddleware, tenantMiddleware,wrapAsync(handleStripeWebhook) );


export default router;