import express from 'express'
import {validateSchema} from '../middleware/validateSchema.js'
import {expenseSchema } from '../schemas/index.js' 
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js'
import { createExpense, getExpenses } from '../controllers/expenseController.js';

const router = express.Router();

router.route('/create' )
.post( authMiddleware ,allowRoles(['admin']),validateSchema(expenseSchema ), wrapAsync (createExpense))

router.route('/list' )
.get( authMiddleware ,allowRoles(['admin']), wrapAsync (getExpenses))

export default router;