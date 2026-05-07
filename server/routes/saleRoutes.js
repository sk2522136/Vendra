import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js'
import {validateSchema} from '../middleware/validateSchema.js'
import {createSaleSchema,updateSaleSchema,processReturnSchema} from '../schemas/index.js' 
import { allowRoles } from '../middleware/roleMiddleware.js';
import { createSale, deleteSale,getSalesByCustomer, updateSale,processReturn } from '../controllers/saleController.js';

const router = express.Router();




router.route('/create')
.post( authMiddleware , allowRoles(['admin','staff']) ,validateSchema(createSaleSchema), wrapAsync(createSale) );

router.route('/customer/:customerId')
.get(  authMiddleware  , wrapAsync(getSalesByCustomer) );


router.route('/:id')
.put(  authMiddleware , allowRoles(['admin','staff']) ,validateSchema(updateSaleSchema), wrapAsync(updateSale) )
.delete( authMiddleware , allowRoles(['admin','staff']) , wrapAsync(deleteSale) )

router.route('/:id/return')
.post( authMiddleware ,allowRoles(['admin','staff']), validateSchema(processReturnSchema), wrapAsync(processReturn) );



export default router;