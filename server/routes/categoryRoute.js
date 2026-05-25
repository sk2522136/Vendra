import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js'
import {categorySchema} from '../schemas/index.js' 
import {validateSchema} from '../middleware/validateSchema.js'
import { allowRoles } from '../middleware/roleMiddleware.js';
import {createCategory , getAllCategories , updateCategory , deleteCategory} from '../controllers/categoryController.js';

const router = express.Router();

router.route('/')
.get( authMiddleware , allowRoles(['admin','staff']) , wrapAsync(getAllCategories))

router.route('/create')
.post(authMiddleware , allowRoles(['admin']) ,validateSchema(categorySchema), wrapAsync(createCategory))

router.route('/:id')
.put(  authMiddleware , allowRoles(['admin']) ,validateSchema(categorySchema), wrapAsync(updateCategory))
.delete( authMiddleware , allowRoles(['admin']) , wrapAsync(deleteCategory))

export default router;