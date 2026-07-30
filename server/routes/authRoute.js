import express from 'express';
import wrapAsync from '../utils/wrapAsync.js'
import {validateSchema} from '../middleware/validateSchema.js'
import {loginSchema,registerSchema,signupSchema} from '../schemas/index.js' 
import {userLogin,logout,registerStaff, isAuth,getAllStaff, refreshAccessToken,verifyEmail, deleteStaff,signup} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { loginLimiter } from '../middleware/loginLimiter.js';
import tenantMiddleware from '../middleware/tenantMiddleware.js';



const router = express.Router();

router.route('/signup')
  .post(validateSchema(signupSchema),loginLimiter, wrapAsync(signup));

router.route('/login')
.post(validateSchema(loginSchema),loginLimiter,wrapAsync(userLogin))

router.route('/register')
.post(authMiddleware ,tenantMiddleware , allowRoles(['admin']),validateSchema(registerSchema),wrapAsync(registerStaff))


router.route('/logout')
.post(authMiddleware, wrapAsync(logout))

router.route('/refresh')
.post( refreshAccessToken);

router.route('/is-auth')
.get(authMiddleware ,wrapAsync(isAuth))



router.route('/staff') 
  .get(authMiddleware,tenantMiddleware , allowRoles(['admin']), wrapAsync(getAllStaff));

  router.route('/staff/:id')
  .delete(authMiddleware,tenantMiddleware , allowRoles(['admin']), wrapAsync(deleteStaff));

  
  router.route('/verify-email/:token')
    .get(wrapAsync(verifyEmail));

export default router;

