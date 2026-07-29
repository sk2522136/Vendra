import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import tenantMiddleware from '../middleware/tenantMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js'
import {productSchema} from '../schemas/index.js' 
import {validateSchema} from '../middleware/validateSchema.js'
import { allowRoles } from '../middleware/roleMiddleware.js';
import {createProduct,getAllProducts,getProductById,updateProduct,deleteProduct} from '../controllers/productController.js';
import multerConfig from '../config/multerCloudinary.js'
import { getProductByCategory } from '../controllers/categoryController.js';


const router = express.Router();

router.route('/')
.get(  authMiddleware , tenantMiddleware , wrapAsync(getAllProducts))

router.route('/create')
.post( authMiddleware , tenantMiddleware , allowRoles(['admin']),multerConfig.upload.single('image'),validateSchema(productSchema),  wrapAsync(createProduct))

router.route('/category/:id')
.get( authMiddleware , tenantMiddleware , allowRoles(['admin', 'staff' ]) ,wrapAsync(getProductByCategory))

router.route('/:id')
.get( authMiddleware,tenantMiddleware , allowRoles(['admin','staff']) , wrapAsync(getProductById))
.put( authMiddleware ,tenantMiddleware, allowRoles(['admin']) ,multerConfig.upload.single('image'), wrapAsync(updateProduct))
.delete( authMiddleware ,tenantMiddleware, allowRoles(['admin']) , wrapAsync(deleteProduct))





export default router;