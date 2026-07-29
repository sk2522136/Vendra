import express from 'express';
import wrapAsync from '../utils/wrapAsync.js';
import { getAllCustomers } from '../controllers/customerController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import tenantMiddleware from '../middleware/tenantMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
.get(authMiddleware, tenantMiddleware ,allowRoles(['admin','staff']),wrapAsync(getAllCustomers))

export default router;