import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//reciept folder
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

      //  HEADER 
      doc.fontSize(24).font('Helvetica-Bold').text('VENDRA', { align: 'center' });
      doc.fontSize(9).font('Helvetica').text('AUTOMATED INVENTORY MANAGEMENT SYSTEM', { align: 'center', tracking: 1 });
      doc.moveDown(0.4);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke();

      doc.moveDown(0.8);

      // Receipt info
      const metaTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold').text(`Receipt #: `, 50, metaTop);
      doc.font('Helvetica').text(`${receiptNumber}`, 105, metaTop);
      
      doc.font('Helvetica-Bold').text(`Date: `, 380, metaTop);
      doc.font('Helvetica').text(`${new Date(saleData.createdAt || Date.now()).toLocaleDateString('en-PK')}`, 415, metaTop);
      
      doc.font('Helvetica-Bold').text(`Time: `, 380, metaTop + 14);
      doc.font('Helvetica').text(`${new Date(saleData.createdAt || Date.now()).toLocaleTimeString('en-PK')}`, 415, metaTop + 14);

      doc.moveDown(1.5);

      // CUSTOMER INFO 
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

      //  ITEMS TABLE HEADER 
      const tableTop = doc.y;
      const col1 = 50;   // Item Title Description
      const col2 = 300;  // Quantity Box
      const col3 = 380;  // Unit Price Tag
      const col4 = 465;  // Column Matrix Accumulator 

      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Item Description', col1, tableTop);
      doc.text('Qty', col2, tableTop, { width: 40, align: 'center' });
      doc.text('Unit Price', col3, tableTop, { width: 75, align: 'right' });
      doc.text('Total Price', col4, tableTop, { width: 80, align: 'right' });

      doc.moveDown(0.4);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(1).stroke();

      // ITEMS DATA 
      let yPosition = doc.y + 8;
      doc.fontSize(9).font('Helvetica');

      const itemsList = saleData.items || [];
      itemsList.forEach((item) => {
        const pName = item.productName || (item.product && item.product.name) || "Inventory Item";
        doc.text(pName.substring(0, 32).toUpperCase(), col1, yPosition);
        doc.text(item.quantity.toString(), col2, yPosition, { width: 40, align: 'center' });
        
        const price = item.sellPrice || item.price || 0;
        const lineTotal = item.totalPrice || (price * item.quantity);
        
        doc.text(`Rs ${price.toLocaleString()}`, col3, yPosition, { width: 75, align: 'right' });
        doc.text(`Rs ${lineTotal.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });
        yPosition += 18; 
      });

      doc.moveTo(50, yPosition).lineTo(545, yPosition).lineWidth(0.5).stroke();
      yPosition += 10;

      // FINANCIAL  SUMMARY
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('SUBTOTAL:', col3, yPosition, { width: 75, align: 'right' });
      
      const sub = saleData.subtotal || saleData.totalAmount || 0;
      doc.text(`Rs ${sub.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });

      yPosition += 16;

      if (saleData.discount && saleData.discount > 0) {
        doc.text('DISCOUNT:', col3, yPosition, { width: 75, align: 'right' });
        doc.text(`-Rs ${Number(saleData.discount).toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });
        yPosition += 16;
      }

      // Amount paid 
      const netPayable = Math.max(0, sub - (saleData.discount || 0));
      doc.fontSize(10).font('Helvetica-Bold').text('PAID AMOUNT:', col3, yPosition, { width: 75, align: 'right' });
      // ✅ FIX: Use paidAmount directly (not receivedAmount)
      const finalPaid = saleData.paidAmount ? Number(saleData.paidAmount) : 0;
      doc.text(`Rs ${finalPaid.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });
      yPosition += 16;

      // Remaining balance checking computation block
      const remainingBalance = netPayable - (saleData.paidAmount || 0);
      if (remainingBalance > 0) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#dc2626').text('DUE BALANCE:', col3, yPosition, { width: 75, align: 'right' });
        doc.text(`Rs ${remainingBalance.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });
        yPosition += 18;
      }

      // GRAND TOTAL BOX RENDER
      doc.fillColor('#000000'); // Color reset to neutral dark
      doc.moveTo(320, yPosition).lineTo(545, yPosition).lineWidth(1).stroke();
      yPosition += 8;

      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('GRAND TOTAL:', col3, yPosition, { width: 75, align: 'right' });
      doc.text(`Rs ${netPayable.toLocaleString()}`, col4, yPosition, { width: 80, align: 'right' });

    
      doc.moveDown(4);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).lineWidth(0.5).stroke();
      doc.moveDown(0.6);

      const paymentMethodStr = saleData.paymentMethod || saleData.customerType || "cash";
      doc.fontSize(9).font('Helvetica').text(`Transaction Gateway Mode: ${paymentMethodStr.toUpperCase()}`, { align: 'center' });
      doc.moveDown(0.2);
      doc.fontSize(9).font('Helvetica-Bold').text('Thank you for choosing VENDRA!', { align: 'center' });
      doc.fontSize(7).font('Helvetica').text('Computer generated secure ledger token. No signature required.', { align: 'center', opacity: 0.6 });

      // PDF 
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