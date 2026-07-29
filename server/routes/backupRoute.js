import express from 'express';
import {
  downloadBackup,
  restoreBackup,
  getBackupStatus
} from '../controllers/backupController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import tenantMiddleware from '../middleware/tenantMiddleware.js';
import wrapAsync from '../utils/wrapAsync.js';

const router = express.Router();

// Download encrypted 
router.get('/download',authMiddleware,tenantMiddleware ,wrapAsync(downloadBackup));

// Restore from encrypted backup
router.post('/restore',authMiddleware,tenantMiddleware,wrapAsync(restoreBackup));

// Get backup status
router.get('/status',authMiddleware,tenantMiddleware,wrapAsync(getBackupStatus));

export default router;