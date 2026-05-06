import express from 'express';
import wrapAsync from '../utils/wrapAsync.js'
import {validateSchema} from '../middleware/validateSchema.js'
import {loginSchema,registerSchema} from '../schemas/index.js' 
import {userLogin,logout,registerStaff, isAuth,getAllStaff} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';


const router = express.Router();

router.route('/register')
.post(authMiddleware , allowRoles(['admin']),validateSchema(registerSchema),wrapAsync(registerStaff))

router.route('/login')
.post(validateSchema(loginSchema),wrapAsync(userLogin))

router.route('/logout')
.post(authMiddleware, wrapAsync(logout))

router.route('/is-auth')
.get(authMiddleware,wrapAsync(isAuth))

router.route('/staff') // 👈 ADD یہ
  .get(authMiddleware, allowRoles(['admin']), wrapAsync(getAllStaff));

export default router;

