import express from 'express';
import wrapAsync from '../utils/wrapAsync.js'
import {validateSchema} from '../middleware/validateSchema.js'
import {loginSchema,registerSchema} from '../schemas/index.js' 
import {userLogin,logout,registerStaff, isAuth,getAllStaff, refreshAccessToken,verifyEmail, deleteStaff} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { loginLimiter } from '../middleware/loginLimiter.js';


const router = express.Router();

router.route('/register')
.post(authMiddleware , allowRoles(['admin']),validateSchema(registerSchema),wrapAsync(registerStaff))

router.route('/login')
.post(validateSchema(loginSchema),loginLimiter,wrapAsync(userLogin))

router.route('/logout')
.post(authMiddleware, wrapAsync(logout))

router.route('/refresh')
.post( refreshAccessToken);

router.route('/is-auth')
.get(authMiddleware,wrapAsync(isAuth))



router.route('/staff') 
  .get(authMiddleware, allowRoles(['admin']), wrapAsync(getAllStaff));

  router.route('/staff/:id')
  .delete(authMiddleware, allowRoles(['admin']), wrapAsync(deleteStaff));

  
  router.route('/verify-email/:token')
    .get(wrapAsync(verifyEmail));

export default router;

