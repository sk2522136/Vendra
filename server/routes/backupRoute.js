import express from 'express';
import {
  downloadBackup,
  restoreBackup,
  getBackupStatus
} from '../controllers/backupController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js';

const router = express.Router();

// Download encrypted 
router.get('/download',authMiddleware,wrapAsync(downloadBackup));

// Restore from encrypted backup
router.post('/restore',authMiddleware,wrapAsync(restoreBackup));

// Get backup status
router.get('/status',authMiddleware,wrapAsync(getBackupStatus));

export default router;