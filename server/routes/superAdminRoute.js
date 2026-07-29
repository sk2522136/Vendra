import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import tenantMiddleware from '../middleware/tenantMiddleware.js';
import superAdminMiddleware from '../middleware/superAdminMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import {getAdminDashboardStats,getAllTenants,toggleTenantStatus,updateTenantPlan,getRevenueAnalytics} from '../controllers/superAdminController.js';
import wrapAsync from '../utils/wrapAsync.js';


const router = express.Router();

const superAdminAuth = [
  authMiddleware,
  tenantMiddleware,
  superAdminMiddleware,
  allowRoles(['super_admin'])
];

router.get('/stats',superAdminAuth,wrapAsync( getAdminDashboardStats));
router.get('/tenants',superAdminAuth,wrapAsync( getAllTenants));
router.patch('/tenants/:id/status',superAdminAuth, wrapAsync( toggleTenantStatus));
router.patch('/tenants/:id/plan',superAdminAuth,wrapAsync (updateTenantPlan));



router.get('/revenue', superAdminAuth, wrapAsync(getRevenueAnalytics));

export default router;