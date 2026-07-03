import { generateReceipt } from './receiptGenerator.js';
import fs from 'fs';

/**
 * @param {Object} receiptPayload 
 * @param {String} receiptNumber 
 * @returns {Promise<{success, pdfBase64, fileName}>}
 */
export const generateAndGetReceiptPDF = async (receiptPayload, receiptNumber) => {
  try {
    

    // Generate PDF
    const receiptResult = await generateReceipt(receiptPayload, receiptNumber);

    if (!receiptResult.success) {
      throw new Error("Receipt generation failed");
    }

    // Convert to base64
    const fileBuffer = fs.readFileSync(receiptResult.filePath);
    const pdfBase64 = `data:application/pdf;base64,${fileBuffer.toString('base64')}`;


    return {
      success: true,
      pdfBase64,
      fileName: receiptResult.fileName,
      filePath: receiptResult.filePath
    };

  } catch (error) {
    console.error("Receipt generation error:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Prepare receipt data from sale information
 * @param {Object} sale - Sale document
 * @param {Object} customer - Customer document
 * @param {Array} itemsForReceipt - Receipt items
 * @param {String} receiptNumber - Receipt number
 * @returns {Object} Receipt payload
 */
export const prepareReceiptPayload = (sale, customer, itemsForReceipt, receiptNumber, paymentMethod) => {
  return {
    receiptNumber,
    customerName: customer.name,
    phoneNumber: customer.phoneNumber,
    customerType: customer.customerType,
    items: itemsForReceipt,
    totalAmount: sale.totalAmount,
    discount: sale.discount || 0,
    paidAmount: sale.paidAmount,
    paymentMethod: paymentMethod || 'cash',
    createdAt: sale.createdAt
  };
};