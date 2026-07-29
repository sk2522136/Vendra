import express from 'express';
import { processChatMessage } from '../controllers/chatbotController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import tenantMiddleware from '../middleware/tenantMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js';

const router = express.Router();

router.post(
  '/message',
  authMiddleware,
  tenantMiddleware ,
  wrapAsync(processChatMessage)
);

export default router;