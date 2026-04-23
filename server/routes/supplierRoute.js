import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js'
import { validateSchema } from '../middleware/validateSchema.js'
import { supplierSchema, purchaseSchema, paymentSchema } from '../schemas/index.js'; 
import { allowRoles } from '../middleware/roleMiddleware.js';
import { createSupplier, deleteSupplier, getAllSuppliers, getSupplierById, updateSupplier,addPurchase,addPayment} from '../controllers/supplierController.js';

const router = express.Router();

router.route('/')
    .get(authMiddleware, allowRoles(['admin', 'staff']), wrapAsync(getAllSuppliers))

router.route('/create')
    .post(authMiddleware, allowRoles(['admin', 'staff']), validateSchema(supplierSchema), wrapAsync(createSupplier))

router.route('/:id')
    .get(authMiddleware, allowRoles(['admin', 'staff']), wrapAsync(getSupplierById))
    .put(authMiddleware, allowRoles(['admin', 'staff']), validateSchema(supplierSchema), wrapAsync(updateSupplier))
    .delete(authMiddleware, allowRoles(['admin', 'staff']), wrapAsync(deleteSupplier))

router.route('/:id/purchase')
    .post(authMiddleware, allowRoles(['admin', 'staff']), validateSchema(purchaseSchema), wrapAsync(addPurchase))

router.route('/:id/payment')
    .post(authMiddleware, allowRoles(['admin', 'staff']), validateSchema(paymentSchema), wrapAsync(addPayment))

export default router;