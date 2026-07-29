import express from 'express'
import wrapAsync from '../utils/wrapAsync.js'
import { getInventoryHistory, getInventoryStatus } from '../controllers/inventoryLog.js';
import authMiddleware from '../middleware/authMiddleware.js'
import tenantMiddleware from '../middleware/tenantMiddleware.js';
import {allowRoles} from '../middleware/roleMiddleware.js'

const router = express.Router();

router.route("/status")
.get(   authMiddleware , tenantMiddleware, allowRoles(['admin']) ,wrapAsync(getInventoryStatus) )

router.route("/history/:productId" )
.get(  authMiddleware ,tenantMiddleware, allowRoles(['admin']) ,wrapAsync(getInventoryHistory))




export default router;