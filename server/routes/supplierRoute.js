import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import tenantMiddleware from '../middleware/tenantMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js'
import { validateSchema } from '../middleware/validateSchema.js'
import { supplierSchema, purchaseSchema, paymentSchema } from '../schemas/index.js'; 
import { allowRoles } from '../middleware/roleMiddleware.js';
import { createSupplier, deleteSupplier, getAllSuppliers, getSupplierById, updateSupplier,addPurchase,addPayment} from '../controllers/supplierController.js';

const router = express.Router();

router.route('/')
    .get(authMiddleware,tenantMiddleware, allowRoles(['admin']), wrapAsync(getAllSuppliers))

router.route('/create')
    .post(authMiddleware, tenantMiddleware ,allowRoles(['admin']), validateSchema(supplierSchema), wrapAsync(createSupplier))

router.route('/:id')
    .get(authMiddleware,tenantMiddleware , allowRoles(['admin']), wrapAsync(getSupplierById))
    .put(authMiddleware,tenantMiddleware , allowRoles(['admin']), validateSchema(supplierSchema), wrapAsync(updateSupplier))
    .delete(authMiddleware, tenantMiddleware , allowRoles(['admin']), wrapAsync(deleteSupplier))

router.route('/:id/purchase')
    .post(authMiddleware, tenantMiddleware ,allowRoles(['admin']), validateSchema(purchaseSchema), wrapAsync(addPurchase))

router.route('/:id/payment')
    .post(authMiddleware, tenantMiddleware , allowRoles(['admin']), validateSchema(paymentSchema), wrapAsync(addPayment))

export default router;