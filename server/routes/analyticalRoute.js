import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js';
import tenantMiddleware from '../middleware/tenantMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { getPaymentMethod, getProfitChart, getSaleChart, getTopSellProd } from '../controllers/analyticalController.js';
import wrapAsync from '../utils/wrapAsync.js';

const router = express.Router();


router.route('/sale')
.get(authMiddleware,tenantMiddleware, allowRoles(['admin']), wrapAsync(getSaleChart));

router.route('/profit')
.get(authMiddleware,tenantMiddleware, allowRoles(['admin']), wrapAsync(getProfitChart));

router.route('/payment')
.get(authMiddleware,tenantMiddleware, allowRoles(['admin']), wrapAsync(getPaymentMethod));

router.route('/products')
.get(authMiddleware,tenantMiddleware, allowRoles(['admin']), wrapAsync(getTopSellProd));

export default router;