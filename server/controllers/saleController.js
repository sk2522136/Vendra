import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import SaleItem from "../models/SaleItem.js"
import Sale from "../models/Sale.js"
import Payment from "../models/payment.js"
import { inventoryLogChange } from "./inventoryLog.js"
import ExpressError from "../utils/expressError.js"
import { updateStock } from '../utils/stockService.js'
import mongoose from "mongoose"
import { emitDashboardRefresh } from "../utils/emitDashboardRefresh.js";
import { generateReceipt } from "../utils/receiptGenerator.js"; // 👈 Raseed generator ko import kiya
import fs from "fs";


// api/sale/create
export const createSale = async (req, res) =>{
  const {name, phoneNumber, items, customerType, paidAmount, discount = 0, notes = ''} = req.body;
     
    for (let item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new ExpressError('Product not found', 404);
    }

    if (product.quantity < item.quantity) {
      throw new ExpressError('Insufficient stock', 400);
    }
  }
  
  let customer = await Customer.findOne({ phoneNumber})
     if(!customer){
     customer = new Customer({
      name: name,
      phoneNumber: phoneNumber,
      currentBalance: 0,
      lastPaymentDate: null,
      customerType: customerType || 'cash',
      totalPurchased: 0,
      totalPaid: 0
     });
    
     await customer.save();
    }

    let totalAmount = 0;
    let saleItemIds = [];
    let itemsForReceipt = [];
    
    for (let item of items){
    let product = await Product.findById(item.product);
    let itemTotal = item.quantity * item.sellPrice
    totalAmount += itemTotal;
     
   //create saleItem
   let saleItem = await SaleItem.create({
        saleRef: null,
        product: product._id,
        quantity: item.quantity,
        sellPrice: item.sellPrice,
        totalPrice: itemTotal,
    });
    saleItemIds.push(saleItem._id);

    // PDF structural data push
    itemsForReceipt.push({
      productName: product.name,
      quantity: item.quantity,
      sellPrice: item.sellPrice,
      totalPrice: itemTotal
    });
 }

 // Discount apply karo
 totalAmount = totalAmount - discount;

 let userId = req.user._id;
  if (req.user._id === 'admin') {
    userId = new mongoose.Types.ObjectId();
  }

  //  Create Sale
 const sale = await Sale.create({
            items: saleItemIds,
            customer: customer._id,
            totalAmount,
            paidAmount: paidAmount || 0,
            discount: discount,
            notes: notes,
            createdBy: userId
        });

   

 //  Update SaleItems with saleRef
    await SaleItem.updateMany(
    { _id: { $in: saleItemIds } },
    { $set: { saleRef: sale._id } }
);


for (let item of items) {

    await updateStock({
      productId: item.product,
      change: -item.quantity,
      type: "Sale",
      sale: sale._id,
      user: req.user._id
    });

  }
  
  // Update Customer totals
  customer.totalPurchased += totalAmount + discount; // Original amount without discount
  if (paidAmount > 0) {
    customer.totalPaid += paidAmount;
  }
  
  emitDashboardRefresh();

  // 7. 🔥 DYNAMIC GENERATION OF PDF RECEIPT STREAM 🔥
  let pdfBase64Data = null;
  let receiptFileName = "";
  const invoiceNumber = `INV-${sale._id.toString().slice(-6).toUpperCase()}`;

  try {
    const receiptPayload = {
      createdAt: sale.createdAt,
      customerName: customer.name,
      phoneNumber: customer.phoneNumber,
      customerType: customer.customerType,
      items: itemsForReceipt,
      totalAmount: totalAmount,
      discount: discount,
      paidAmount: paidAmount || 0,
      paymentMethod: customer.customerType === 'cash' ? 'Cash' : 'Credit Ledger'
    };

    const receiptResult = await generateReceipt(receiptPayload, invoiceNumber);

    if (receiptResult.success) {
      const fileBuffer = fs.readFileSync(receiptResult.filePath);
      pdfBase64Data = `data:application/pdf;base64,${fileBuffer.toString('base64')}`;
      receiptFileName = receiptResult.fileName;
    }
  } catch (receiptError) {
    console.error("Receipt Engine failed silently:", receiptError.message);
  }

  // 8. Single Unified JSON Response
  return res.status(201).json({
    success: true,
    message: "Sale created successfully",
    sale,
    pdfData: pdfBase64Data, 
    fileName: receiptFileName
  });

  
  //  Update Customer balance & lastPaymentDate
  const remainingBalance = totalAmount - (paidAmount || 0);
  if (customer.customerType === 'credit' && remainingBalance > 0) {
      customer.currentBalance += remainingBalance;
  }
  if (paidAmount > 0) {
      customer.lastPaymentDate = new Date();
  }
  await customer.save();

   // Create Payment record if paidAmount > 0
  if (paidAmount && paidAmount > 0) {
      await Payment.create({
          sale: sale._id,
          customer: customer._id,
          amount: paidAmount,
          paymentMethod: customer.customerType === 'cash' ? 'cash' : 'credit',
          paymentStatus: 'success',
          recievedBy: req.user._id
      });
  }

   res.status(201).json({
      success: true,
      message: "Sale created successfully",
      sale
  });
     
}

  // api/sale/:id
  export const updateSale = async (req, res) => {
  const { id } = req.params;
  const { amountToPay } = req.body;  

  const sale = await Sale.findById(id);

  if (!sale) {
    throw new ExpressError("Sale not found", 404);
  }

  const totalAmount = sale.totalAmount;
  const oldPaidAmount = sale.paidAmount;
  const remainingAmount = totalAmount - oldPaidAmount;

  // Check: Payment exceeds remaining
  if (amountToPay > remainingAmount) {
    throw new ExpressError(
      `Cannot pay Rs ${amountToPay}. Remaining amount is Rs ${remainingAmount}`,
      400
    );
  }

  // Calculate new total paid
  const newPaidAmount = oldPaidAmount + amountToPay;  

  // Find customer
  const customer = await Customer.findById(sale.customer);

  if (!customer) {
    throw new ExpressError("Customer not found", 404);
  }

  // Update customer balance (for credit customers)
  if (customer.customerType === 'credit') {
    customer.currentBalance -= amountToPay;  
  }

  // Update customer totalPaid
  customer.totalPaid += amountToPay;

  // Update lastPaymentDate
  if (amountToPay > 0) {
    customer.lastPaymentDate = new Date();
  }

  await customer.save();

  // Update sale paidAmount
  sale.paidAmount = newPaidAmount;
  
  // Agar fully paid ho gaya toh status change karo
  if (sale.paidAmount === sale.totalAmount) {
    sale.paymentStatus = 'success';
  }
  
  await sale.save();

  // Create payment record
  if (amountToPay > 0) {
    await Payment.create({
      sale: sale._id,
      customer: customer._id,
      amount: amountToPay,  
      paymentMethod: customer.customerType === 'cash' ? 'cash' : 'credit',
      paymentStatus: 'success',
      recievedBy: req.user._id
    });
  }

  // Fetch updated sale
  const updatedSale = await Sale.findById(id)
    .populate('customer')
    .populate('items')
    .populate('createdBy');
    
  //socket dashboard refresh
  emitDashboardRefresh();

  return res.status(200).json({
    success: true,
    message: "Sale payment updated successfully",
    sale: updatedSale
  });
};
  
// api/sale/:id
 export const deleteSale = async (req, res) => {
    const { id } = req.params;

    // Sale find 
    const sale = await Sale.findById(id)
        .populate('items')
        .populate('customer');

    if (!sale) {
        throw new ExpressError("Sale is not found", 404)
    }

    const customer = sale.customer;

    // Credit customer check — remaining balance hai toh delete nahi hogi
    if (customer.customerType === 'credit') {
        const remainingBalance = sale.totalAmount - sale.paidAmount;
        
        if (remainingBalance > 0) {
            throw new ExpressError(
                `Credit customer ki ye sale delete nahi ho sakti — Rs ${remainingBalance} abhi baki hai`, 
                400
            )
        }
    }

    for (let item of sale.items) {

        await updateStock({
          productId: item.product,
          change: +item.quantity,
          type: "Sale Cancellation",
          sale: sale._id,
          user: req.user._id
        });

    }

    // SaleItems delete
    await SaleItem.deleteMany({ _id: { $in: sale.items } });

    // Payments delete
    await Payment.deleteMany({ sale: sale._id });

    // Update customer totals
    customer.totalPurchased -= (sale.totalAmount + sale.discount);
    customer.totalPaid -= sale.paidAmount;
    await customer.save();

    // Sale delete
    await Sale.findByIdAndDelete(id);
    
    // Socket dashboard refresh
    emitDashboardRefresh();

    return res.status(200).json({
        success: true,
        message: "Sale deleted successfully",
        data: {
            customerName: customer.name,
            customerPhone: customer.phoneNumber,
            totalAmountDeleted: sale.totalAmount,
            totalPaidDeleted: sale.paidAmount
        }
    });
};

// GET SALES BY CUSTOMER  /api/sale/customer/:customerId 
export const getSalesByCustomer = async (req, res) => {
         const { customerId } = req.params;
         const customer = await Customer.findById(customerId);

         if (!customer) {
            throw new ExpressError("Customer is not Found" ,404)
        }

        const sales = await Sale.find({ customer: customerId })
            .populate('items')
            .populate('createdBy')
            .sort({ createdAt: -1 });

        // Calculate customer statistics
        let totalPurchased = 0;
        let totalPaid = 0;
        let totalPending = 0;
        let totalRefunded = 0;
        let paidSalesCount = 0;
        let pendingSalesCount = 0;

    sales.forEach(sale => {

            totalPurchased += sale.totalAmount;
            totalPaid += sale.paidAmount;
            totalRefunded += sale.refundedAmount || 0;
            const pending = sale.totalAmount - sale.paidAmount;
            totalPending += pending;

            if (sale.totalAmount === sale.paidAmount) {
                paidSalesCount++;
            } else {
                pendingSalesCount++;
            }
        });

        // Format sales data
        const formattedSales = sales.map(sale => ({
            saleId: sale._id,
            receiptNumber: sale.receiptNumber,
            totalAmount: sale.totalAmount,
            paidAmount: sale.paidAmount,
            discount: sale.discount,
            refundedAmount: sale.refundedAmount || 0,
            remainingBalance: sale.totalAmount - sale.paidAmount,
            itemCount: sale.items.length,
            paymentMethod: sale.paymentMethod,
            paymentStatus: sale.paymentStatus,
            createdDate: sale.createdAt,
            updatedDate: sale.updatedAt,
            createdBy: sale.createdBy?.name || 'Unknown',
            status: sale.totalAmount === sale.paidAmount ? 'Paid' : 'Pending',
            items: sale.items.map(item => ({
                itemId: item._id,
                product: item.product,
                quantity: item.quantity,
                sellPrice: item.sellPrice,
                itemTotal: item.totalPrice
            }))
        }));

        return res.status(200).json({
            success: true,
            message: "Customer sales retrieved successfully",
            customerDetails: {
                customerId: customer._id,
                customerName: customer.name,
                phoneNumber: customer.phoneNumber,
                email: customer.email,
                customerType: customer.customerType,
                currentBalance: customer.currentBalance,
                lastPaymentDate: customer.lastPaymentDate,
                isActive: customer.isActive,
                createdDate: customer.createdAt
            },
            salesStatistics: {
                totalSales: sales.length,
                paidSales: paidSalesCount,
                pendingSales: pendingSalesCount,
                totalPurchased: totalPurchased,
                totalPaid: totalPaid,
                totalPending: totalPending,
                totalRefunded: totalRefunded,
                remainingBalance: totalPurchased - totalPaid,
                averageSaleAmount: sales.length > 0 ? Math.round(totalPurchased / sales.length) : 0
            },
            data: formattedSales
        });
};
 
export const processReturn = async (req, res) => {

  const { saleId, productId, quantity } = req.body;

  //  Find Sale
  const sale = await Sale.findById(saleId)
    .populate("customer")
    .populate("items");

  if (!sale) {
    throw new ExpressError("Sale not found", 404);
  }

  //  Find Sale Item
  const saleItem = await SaleItem.findOne({
    saleRef: saleId,
    product: productId
  }).populate("product");

  if (!saleItem) {
    throw new ExpressError("Sale item not found", 404);
  }

  if (saleItem.quantity < quantity) {
    throw new ExpressError("Cannot return more than purchased quantity", 400);
  }

  //  Calculate refund
  const price = saleItem.sellPrice;
  const returnAmount = price * quantity;

  //  STOCK RESTORE + LOG
  await updateStock({
    productId,
    change: +quantity,
    type: "Return",
    sale: saleId,
    user: req.user._id
  });

  // Update Sale Item
  saleItem.quantity -= quantity;

  if (saleItem.quantity === 0) {
    await SaleItem.findByIdAndDelete(saleItem._id);

    await Sale.updateOne(
      { _id: saleId },
      { $pull: { items: saleItem._id } }
    );
  } else {
    await saleItem.save();
  }

  //  Update Sale Total
  sale.totalAmount -= returnAmount;
  sale.refundedAmount = (sale.refundedAmount || 0) + returnAmount;

  // safe paid adjustment
  if (sale.paidAmount > sale.totalAmount) {
    sale.paidAmount = sale.totalAmount;
  }

  await sale.save();

  // Update Customer Balance
  const customer = sale.customer;

  if (customer.customerType === "credit") {
    customer.currentBalance -= returnAmount;
  }

  // Update customer totalPaid agar refund ho raha hai
  customer.totalPaid -= returnAmount;
  customer.lastPaymentDate = new Date();
  await customer.save();

  // Create Refund Payment
  await Payment.create({
    sale: saleId,
    customer: customer._id,
    amount: -returnAmount,
    paymentMethod: "refund",
    paymentStatus: "success",
    recievedBy: req.user._id
  });
 
  //Socket dashboard refresh
  emitDashboardRefresh();

  // Response
  return res.status(200).json({
    success: true,
    message: "Return processed successfully",
    data: {
      returnedQuantity: quantity,
      refundAmount: returnAmount,
      newSaleTotal: sale.totalAmount,
      newSalePaid: sale.paidAmount,
      newCustomerBalance: customer.currentBalance,
      newRefundedAmount: sale.refundedAmount
    }
  });
};