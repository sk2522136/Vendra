import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { getPaymentMethod, getProfitChart, getSaleChart, getTopSellProd } from '../controllers/analyticalController.js';
import wrapAsync from '../utils/wrapAsync.js';

const router = express.Router();


router.route('/sale')
.get(authMiddleware, allowRoles(['admin','staff']), wrapAsync(getSaleChart));

router.route('/profit')
.get(authMiddleware, allowRoles(['admin','staff']), wrapAsync(getProfitChart));

router.route('/payment')
.get(authMiddleware, allowRoles(['admin','staff']), wrapAsync(getPaymentMethod));

router.route('/products')
.get(authMiddleware, allowRoles(['admin','staff']), wrapAsync(getTopSellProd));

export default router;