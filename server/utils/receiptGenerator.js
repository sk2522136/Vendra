import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// reciept folder
const receiptDir = path.join(__dirname, '../receipts');
if (!fs.existsSync(receiptDir)) {
  fs.mkdirSync(receiptDir, { recursive: true });
}

export const generateReceipt = async (saleData, receiptNumber) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      // File path
      const fileName = `receipt-${receiptNumber}.pdf`;
      const filePath = path.join(receiptDir, fileName);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // HEADER 
      doc.fontSize(24).font('Helvetica-Bold').text('VENDRA', { align: 'center' });
      doc.fontSize(9).font('Helvetica').text('AUTOMATED INVENTORY MANAGEMENT SYSTEM', { align: 'center', tracking: 1 });
      doc.moveDown(0.4);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke();

      doc.moveDown(0.8);

      const metaTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold').text(`Receipt #: `, 50, metaTop);
      doc.font('Helvetica').text(`${receiptNumber}`, 105, metaTop);
      
      doc.font('Helvetica-Bold').text(`Date: `, 380, metaTop);
      doc.font('Helvetica').text(`${new Date(saleData.createdAt || Date.now()).toLocaleDateString('en-PK')}`, 415, metaTop);
      
      doc.font('Helvetica-Bold').text(`Time: `, 380, metaTop + 14);
      doc.font('Helvetica').text(`${new Date(saleData.createdAt || Date.now()).toLocaleTimeString('en-PK')}`, 415, metaTop + 14);

      doc.moveDown(1.5);

      doc.fontSize(10).font('Helvetica-Bold').text('CUSTOMER LEDGER PROFILE', 50, doc.y);
      doc.moveDown(0.3);
      
      const customerTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold').text('Account Name:', 50, customerTop);
      doc.font('Helvetica').text(`${saleData.customerName || saleData.name || 'Walk-in Customer'}`, 130, customerTop);
      
      doc.font('Helvetica-Bold').text('Contact Phone:', 50, customerTop + 14);
      doc.font('Helvetica').text(`${saleData.phoneNumber || 'N/A'}`, 130, customerTop + 14);
      
      doc.font('Helvetica-Bold').text('Account Type:', 380, customerTop);
      doc.font('Helvetica').text(`${(saleData.customerType || 'Cash').toUpperCase()}`, 450, customerTop);

      doc.moveDown(1.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
      doc.moveDown(0.8);

      const tableTop = doc.y;
      const col1 = 50;   
      const col2 = 300; 
      const col3 = 380;  
      const col4 = 465;  

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Item Description', col1, tableTop);
      doc.text('Qty', col2, tableTop, { width: 40, align: 'center' });
      doc.text('Unit Price', col3, tableTop, { width: 75, align: 'right' });
      doc.text('Total Price', col4, tableTop, { width: 80, align: 'right' });

      doc.moveDown(0.4);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke();

      let yPosition = doc.y + 8;
      doc.fontSize(9).font('Helvetica');

      const itemsList = saleData.items || [];
      let grossSubtotal = 0;

      itemsList.forEach((item) => {
        const pName = item.productName || (item.product && item.product.name) || "Inventory Item";
        const price = item.sellPrice || item.price || 0;
        const lineTotal = price * item.quantity;
        
        grossSubtotal += lineTotal;

        doc.text(pName.substring(0, 32).toUpperCase(), col1, yPosition);
        doc.text(item.quantity.toString(), col2, yPosition, { width: 40, align: 'center' });
        doc.text(`Rs ${price.toLocaleString()}`, col3, yPosition, { width: 75, align: 'right' });
        doc.text(`Rs ${lineTotal.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });
        yPosition += 18; 
      });

      doc.moveTo(50, yPosition).lineTo(545, yPosition).lineWidth(0.5).stroke();
      yPosition += 10;

 
      const sub = saleData.subtotal || grossSubtotal;

      const appliedDiscount = Number(saleData.discount || 0);

      const grandTotal = saleData.totalAmount || Math.max(0, sub - appliedDiscount);
      const finalPaid = saleData.paidAmount ? Number(saleData.paidAmount) : 0;
      const remainingBalance = Math.max(0, grandTotal - finalPaid);

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('SUBTOTAL:', col3, yPosition, { width: 75, align: 'right' });
      doc.text(`Rs ${sub.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });

      yPosition += 16;

      if (appliedDiscount > 0) {
        doc.text('DISCOUNT:', col3, yPosition, { width: 75, align: 'right' });
        doc.text(`-Rs ${appliedDiscount.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });
        yPosition += 16;
      }

      // GRAND TOTAL 
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('GRAND TOTAL:', col3, yPosition, { width: 75, align: 'right' });
      doc.text(`Rs ${grandTotal.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });
      yPosition += 16;

      // PAID AMOUNT
      doc.text('PAID AMOUNT:', col3, yPosition, { width: 75, align: 'right' });
      doc.text(`Rs ${finalPaid.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });
      yPosition += 16;

      // DUE BALANCE FOR CREDIT CUSTOMER
      if (remainingBalance > 0) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('DUE BALANCE:', col3, yPosition, { width: 75, align: 'right' });
        doc.text(`Rs ${remainingBalance.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });
        yPosition += 18;
      }

      doc.fillColor('#000000'); 

      doc.moveDown(4);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
      doc.moveDown(0.6);

      const paymentMethodStr = saleData.paymentMethod || saleData.customerType || "cash";
      doc.fontSize(9).font('Helvetica').text(`Transaction Gateway Mode: ${paymentMethodStr.toUpperCase()}`, { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(9).font('Helvetica-Bold').text('Thank you for choosing VENDRA!', { align: 'center' });
      doc.fontSize(7).font('Helvetica').text('Computer generated secure ledger token. No signature required.', { align: 'center', opacity: 0.6 });

      // PDF Write Stream
      doc.end();

      stream.on('finish', () => {
        resolve({
          success: true,
          filePath: filePath,
          fileName: fileName,
          message: 'Receipt generated successfully'
        });
      });

      stream.on('error', (error) => {
        reject({
          success: false,
          error: error.message
        });
      });

    } catch (error) {
      reject({
        success: false,
        error: error.message
      });
    }
  });
};

export default generateReceipt;