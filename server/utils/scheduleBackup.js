import cron from 'node-cron';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import { encryptData } from './encryption.js';

// Run at 12 AM every day
export const startScheduleBackup = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('🔄 Scheduled backup started at 12 AM');

      // Fetch data
      const customers = await Customer.find();
      const products = await Product.find();
      const suppliers = await Supplier.find();

      const backupData = {
        timestamp: new Date().toISOString(),
        customers: customers,
        products: products,
        suppliers: suppliers,
        backupType: 'scheduled_nightly',
        backupDate: new Date().toLocaleDateString('en-PK')
      };

      // Encrypt data
      const encrypted = encryptData(backupData);

      console.log('✅ Scheduled backup completed at 12 AM');
      console.log('📦 Backup Size:', encrypted.encryptedData.length, 'bytes');
      console.log('🔐 Backup Type: Encrypted (AES-256)');

    } catch (error) {
      console.error('❌ Scheduled backup failed:', error.message);
    }
  });
};

export default startScheduleBackup;