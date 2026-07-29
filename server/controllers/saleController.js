import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import SaleItem from "../models/SaleItem.js"
import Sale from "../models/Sale.js"
import Payment from "../models/Payment.js"
import { inventoryLogChange } from "./inventoryLog.js"
import ExpressError from "../utils/expressError.js"
import { updateStock } from '../utils/stockService.js'
import mongoose from "mongoose"
import { emitDashboardRefresh } from "../utils/emitDashboardRefresh.js";
import { generateReceipt } from "../utils/receiptGenerator.js"; 
import { generateAndGetReceiptPDF, prepareReceiptPayload } from '../utils/receiptService.js';
import fs from "fs";



export const createSale = async (req, res) =>{
  const {name, phoneNumber, items, customerType, paidAmount, discount = 0, notes = ''} = req.body;
  const tenantId = req.tenantId;
     
   if (!items || items.length === 0) {
      throw new ExpressError('No items provided for checkout', 400);
    }
 
    const productIds = items.map(item => item.product);
    const dbProducts = await Product.find({ _id: { $in: productIds },tenantId });
 
    const productMap = {};
    dbProducts.forEach(p => { productMap[p._id.toString()] = p; });
 
    for (let item of items) {
      const product = productMap[item.product];
      if (!product) {
        throw new ExpressError(`Product not found for ID: ${item.product}`, 404);
      }
      if (product.quantity < item.quantity) {
        throw new ExpressError(`Insufficient stock for ${product.name}`, 400);
      }
    }
  
  let customer = await Customer.findOne({ phoneNumber,tenantId})
     if(!customer){
     customer = new Customer({
      tenantId: tenantId,
      name: name,
      phoneNumber: phoneNumber,
      currentBalance: 0,
      lastPaymentDate: null,
      customerType: customerType || 'cash',
      totalPurchased: 0,
      totalPaid: 0
     });
    
     await customer.save();
    } else {
      if (customerType && customerType !== customer.customerType) {
        customer.customerType = customerType;
      }
    }
 
    let totalAmount = 0;
    let saleItemIds = [];
    let itemsForReceipt = [];
    
    for (let item of items){
    let product = await Product.findOne({ _id: item.product, tenantId });
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

 totalAmount = totalAmount - discount;
 
 let userId = req.user._id;
  if (req.user._id === 'admin') {
    userId = new mongoose.Types.ObjectId();
  }
 
  
  let paymentMethodForSale = 'cash';
  if (customerType === 'credit') {
    paymentMethodForSale = 'credit';
  } else if (customerType === 'card') {
    paymentMethodForSale = 'card';
  } else {
    paymentMethodForSale = 'cash';
  }
 
  //  Create Sale
 const sale = await Sale.create({
            tenantId: tenantId,
            items: saleItemIds,
            customer: customer._id,
            totalAmount,
            paidAmount: paidAmount || 0,
            discount: discount,
            notes: notes,
            createdBy: userId,
            paymentMethod: paymentMethodForSale,
            paymentStatus: paidAmount > 0 ? 'success' : 'pending'  
 
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
      user: req.user._id,
      tenantId: tenantId
    });
 
  }
  
  customer.totalPurchased += totalAmount + discount; 
  
  if (paidAmount > 0) {
    customer.totalPaid += Number(paidAmount);
    customer.lastPaymentDate = new Date();
  }
 
  const remainingBalance = totalAmount - (paidAmount || 0);
  if (customerType === 'credit' && remainingBalance > 0) {
    customer.currentBalance += remainingBalance;
  }
  
  await customer.save();
 
 
  if (paidAmount && paidAmount > 0) {
    await Payment.create({
      tenantId: tenantId,
      sale: sale._id,
      customer: customer._id,
      amount: paidAmount,
      paymentMethod: paymentMethodForSale,
      paymentStatus: 'success',
      recievedBy: userId
    });
  }
 
 if (typeof emitDashboardRefresh === 'function') {
      emitDashboardRefresh();
    }
 
 
//  RECEIPT GENERATION 
  
  let pdfBase64Data = null;
  let receiptFileName = "";
  
 if (customerType !== 'card') {
  const receiptNumber = `INV-${sale._id.toString().slice(-6).toUpperCase()}`;
  sale.receiptNumber = receiptNumber;
  await sale.save();

  const receiptPayload = prepareReceiptPayload(
    sale,
    customer,
    itemsForReceipt,
    receiptNumber,
    paymentMethodForSale
  );

  const receiptResult = await generateAndGetReceiptPDF(receiptPayload, receiptNumber);

  if (receiptResult.success) {
    pdfBase64Data = receiptResult.pdfBase64;
    receiptFileName = receiptResult.fileName;
  }
}
  return res.status(201).json({
    success: true,
    message: "Sale created successfully",
    sale,
    pdfData: pdfBase64Data, 
    fileName: receiptFileName
  });
     
}

  // api/sale/:id
  export const updateSale = async (req, res) => {
  const { id } = req.params;
  const { amountToPay } = req.body;  
  const tenantId = req.tenantId;

  const sale = await Sale.findOne({_id: id,tenantId});

  if (!sale) {
    throw new ExpressError("Sale not found", 404);
  }

  const totalAmount = sale.totalAmount;
  const oldPaidAmount = sale.paidAmount;
  const remainingAmount = totalAmount - oldPaidAmount;

  if (amountToPay > remainingAmount) {
    throw new ExpressError(
      `Cannot pay Rs ${amountToPay}. Remaining amount is Rs ${remainingAmount}`,
      400
    );
  }

  //  total paid
  const newPaidAmount = oldPaidAmount + amountToPay;  

  const customer = await Customer.findOne({_id: sale.customer,tenantId});

  if (!customer) {
    throw new ExpressError("Customer not found", 404);
  }

  if (customer.customerType === 'credit') {
    customer.currentBalance -= amountToPay;  
  }

  customer.totalPaid += amountToPay;

  if (amountToPay > 0) {
    customer.lastPaymentDate = new Date();
  }

  await customer.save();

  sale.paidAmount = newPaidAmount;
  
  if (sale.paidAmount === sale.totalAmount) {
    sale.paymentStatus = 'success';
  }
  
  await sale.save();

  if (amountToPay > 0) {
    await Payment.create({
      tenantId:tenantId,
      sale: sale._id,
      customer: customer._id,
      amount: amountToPay,  
      paymentMethod: customer.customerType === 'cash' ? 'cash' : 'credit',
      paymentStatus: 'success',
      recievedBy: req.user._id
    });
  }

  const updatedSale = await Sale.findOne({_id: id,tenantId })
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
    const tenantId = req.tenantId;

    // Sale find 
    const sale = await Sale.findOne({_id: id, tenantId})
        .populate('items')
        .populate('customer');

    if (!sale) {
        throw new ExpressError("Sale is not found", 404)
    }

    const customer = sale.customer;

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
          user: req.user._id,
          tenantId: tenantId,
        });

    }

    // SaleItems delete
    const saleItemIds = sale.items.map(item => item._id);
    await SaleItem.deleteMany({ _id: { $in: saleItemIds } });

    // Payments delete
    await Payment.deleteMany({ sale: sale._id ,tenantId: tenantId, });

    // Update customer totals
    customer.totalPurchased -= (sale.totalAmount + sale.discount);
    customer.totalPaid -= sale.paidAmount;
    await customer.save();

    // Sale delete
    await Sale.findByIdAndDelete({_id: id,tenantId});
    
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

//   /api/sale/customer/:customerId 
export const getSalesByCustomer = async (req, res) => {
    const { customerId } = req.params;
    const tenantId = req.tenantId;
    
    const customer = await Customer.findOne({_id: customerId,tenantId});
    if (!customer) {
        throw new ExpressError("Customer is not Found", 404);
    }

    const sales = await Sale.find({ customer: customerId ,tenantId })
        .populate({
            path: 'items',
            populate: {
                path: 'product',
                select: 'name productCode' 
            }
        })
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

    let totalPurchased = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let paidSalesCount = 0;
    let pendingSalesCount = 0;

    sales.forEach(sale => {
        const gross = sale.totalAmount || 0;
        const paid = sale.paidAmount || 0;

        totalPurchased += gross;
        totalPaid += paid;
        totalPending += (gross - paid);

        if (gross === paid) {
            paidSalesCount++;
        } else {
            pendingSalesCount++;
        }
    });

    const formattedSales = sales.map(sale => {
        const isPaid = (sale.totalAmount || 0) === (sale.paidAmount || 0);
        
        return {
            saleId: sale._id,
            receiptNumber: sale.receiptNumber || 'N/A',
            totalAmount: sale.totalAmount || 0,
            paidAmount: sale.paidAmount || 0,
            discount: sale.discount || 0,
            remainingBalance: (sale.totalAmount || 0) - (sale.paidAmount || 0),
            itemCount: sale.items?.length || 0,
            paymentMethod: sale.paymentMethod || 'cash',
            paymentStatus: sale.paymentStatus || (isPaid ? 'success' : 'partial'),
            createdDate: sale.createdAt,
            updatedDate: sale.updatedAt,
            createdBy: sale.createdBy?.name || 'Unknown',
            status: isPaid ? 'Paid' : 'Pending', 
            items: (sale.items || []).map(item => ({
                itemId: item._id,
                productId: item.product?._id || item.product,
                productName: item.product?.name || 'Unknown Product',
                quantity: item.quantity || 0,
                sellPrice: item.sellPrice || 0,
                itemTotal: item.totalPrice || ((item.quantity || 0) * (item.sellPrice || 0))
            }))
        };
    });

    return res.status(200).json({
        success: true,
        message: "Customer sales retrieved successfully",
        customerDetails: {
            customerId: customer._id,
            customerName: customer.name,
            phoneNumber: customer.phoneNumber || "N/A",
            customerType: customer.customerType || "Walk-in",
            currentBalance: customer.currentBalance || 0,
            lastPaymentDate: customer.lastPaymentDate || null
        },
        salesStatistics: {
            totalSales: sales.length, 
            paidSales: paidSalesCount,
            pendingSales: pendingSalesCount,
            totalPurchased: totalPurchased, 
            totalPaid: totalPaid, 
            totalPending: Math.max(0, totalPending), 
            averageSaleAmount: sales.length > 0 ? Math.round(totalPurchased / sales.length) : 0
        },
        data: formattedSales
    });
};
export const processReturn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

    const { saleId, productId, quantity } = req.body;
    const tenantId = req.tenantId;

    // 1. Find Sale
    const sale = await Sale.findOne({_id: saleId,tenantId})
      .populate("customer")
      .populate("items")
      .session(session);

    if (!sale) {
      throw new ExpressError("Sale not found", 404);
    }

  
    const saleItem = await SaleItem.findOne({
      saleRef: saleId,
      product: productId
    }).populate("product").session(session);

    if (!saleItem) {
      throw new ExpressError("Sale item not found", 404);
    }

    if (saleItem.quantity < quantity) {
      throw new ExpressError("Cannot return more than purchased quantity", 400);
    }

    const price = saleItem.sellPrice;
    const returnAmount = price * quantity;

    //STOCK RESTORE 
    await updateStock({
      tenantId:tenantId,
      productId,
      change: +quantity,
      type: "Return",
      sale: saleId,
      user: req.user._id,
      session
    });

    //  Update Sale Item
    saleItem.quantity -= quantity;

    if (saleItem.quantity === 0) {
      await SaleItem.findByIdAndDelete(saleItem._id).session(session);

      await Sale.updateOne(
        { _id: saleId, tenantId },
        { $pull: { items: saleItem._id } }
      ).session(session);
    } else {
      await saleItem.save({ session });
    }

    const oldTotalAmount = sale.totalAmount;
    sale.totalAmount -= returnAmount;
    sale.refundedAmount = (sale.refundedAmount || 0) + returnAmount;

    let creditAdjustment = 0;
    let cashRefundGiven = 0;

    const customer = sale.customer;

    if (customer.customerType === "credit") {
      const remainingBalanceOnSale = oldTotalAmount - sale.paidAmount;
      
      if (remainingBalanceOnSale >= returnAmount) {
        creditAdjustment = returnAmount;
      } else {
        creditAdjustment = remainingBalanceOnSale;
        cashRefundGiven = returnAmount - remainingBalanceOnSale;
      }
      
      customer.currentBalance -= creditAdjustment;
    } else {
      cashRefundGiven = returnAmount;
    }

    if (sale.paidAmount > sale.totalAmount) {
      sale.paidAmount = sale.totalAmount;
    }

    await sale.save({ session });

    if (cashRefundGiven > 0) {
      customer.totalPaid = Math.max(0, (customer.totalPaid || 0) - cashRefundGiven);
    }
    customer.lastPaymentDate = new Date();
    await customer.save({ session });

    await Payment.create([{
      tenantId: tenantId,
      sale: saleId,
      customer: customer._id,
      amount: -returnAmount,
      paymentMethod: "refund",
      paymentStatus: "success",
      recievedBy: req.user._id
    }], { session });

    // Commit changes safely to DB
    await session.commitTransaction();
    session.endSession();

    // Socket refresh
    emitDashboardRefresh();

    return res.status(200).json({
      success: true,
      message: "Return processed successfully",
      data: {
        returnedQuantity: quantity,
        refundAmount: returnAmount,
        cashRefundGiven,
        creditAdjustment,
        newSaleTotal: sale.totalAmount,
        newSalePaid: sale.paidAmount,
        newCustomerBalance: customer.currentBalance,
        newRefundedAmount: sale.refundedAmount
      }
    })

  }