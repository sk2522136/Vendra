import Sale from '../models/Sale.js';
import Payment from '../models/payment.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import ExpressError from '../utils/expressError.js';
import { encryptData, decryptData } from '../utils/encryption.js';

// ===== DOWNLOAD BACKUP AS ENCRYPTED JSON =====
export const downloadBackup = async (req, res) => {
  try {
    // Fetch all 5 critical models
    const sales = await Sale.find();
    const payments = await Payment.find();
    const customers = await Customer.find();
    const products = await Product.find();
    const suppliers = await Supplier.find();

    const backupData = {
      timestamp: new Date().toISOString(),
      backupType: 'complete_encrypted',
      data: {
        sales: sales,
        payments: payments,
        customers: customers,
        products: products,
        suppliers: suppliers
      },
      statistics: {
        totalSales: sales.length,
        totalPayments: payments.length,
        totalCustomers: customers.length,
        totalProducts: products.length,
        totalSuppliers: suppliers.length
      }
    };

    // Encrypt backup data
    const encrypted = encryptData(backupData);

    // Create encrypted file object
    const encryptedBackup = {
      encryptedData: encrypted.encryptedData,
      iv: encrypted.iv,
      timestamp: backupData.timestamp,
      backupType: 'complete_encrypted'
    };

    // Send as encrypted JSON file
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=backup_encrypted_${new Date().toISOString().split('T')[0]}.json`
    );
    res.send(JSON.stringify(encryptedBackup, null, 2));

    console.log('✅ Backup downloaded - Size:', JSON.stringify(encryptedBackup).length, 'bytes');

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== RESTORE BACKUP FROM ENCRYPTED JSON =====
export const restoreBackup = async (req, res) => {
  try {
    const { encryptedData, iv } = req.body;

    if (!encryptedData || !iv) {
      throw new ExpressError('Encrypted data and IV required', 400);
    }

    // Decrypt backup data
    const decryptedData = decryptData(encryptedData, iv);

    // Validate structure - Check for all 5 models
    if (
      !decryptedData.data.sales ||
      !decryptedData.data.payments ||
      !decryptedData.data.customers ||
      !decryptedData.data.products ||
      !decryptedData.data.suppliers
    ) {
      throw new ExpressError('Invalid backup file format', 400);
    }

    res.status(200).json({
      success: true,
      message: 'Backup file decrypted and validated successfully',
      data: {
        backupDate: decryptedData.timestamp,
        backupType: decryptedData.backupType,
        statistics: decryptedData.statistics,
        salesToRestore: decryptedData.data.sales.length,
        paymentsToRestore: decryptedData.data.payments.length,
        customersToRestore: decryptedData.data.customers.length,
        productsToRestore: decryptedData.data.products.length,
        suppliersToRestore: decryptedData.data.suppliers.length
      }
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};

// ===== GET BACKUP STATUS =====
export const getBackupStatus = async (req, res) => {
  try {
    const sales = await Sale.countDocuments();
    const payments = await Payment.countDocuments();
    const customers = await Customer.countDocuments();
    const products = await Product.countDocuments();
    const suppliers = await Supplier.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Backup status retrieved',
      status: {
        totalRecords: sales + payments + customers + products + suppliers,
        sales: sales,
        payments: payments,
        customers: customers,
        products: products,
        suppliers: suppliers,
        backupSystemActive: true,
        realTimeSync: 'Active',
        scheduledBackup: 'Daily at 12 AM',
        encryptionType: 'AES-256'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};