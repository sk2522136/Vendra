import express from 'express';
import { processChatMessage } from '../controllers/chatbotController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js';

const router = express.Router();

router.post(
  '/message',
  authMiddleware,
  wrapAsync(processChatMessage)
);

export default router;