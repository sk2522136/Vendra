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
import { generateReceipt } from "../utils/receiptGenerator.js"; 
import fs from "fs";


// api/sale/create
export const createSale = async (req, res) =>{
  const {name, phoneNumber, items, customerType, paidAmount, discount = 0, notes = ''} = req.body;
     
   if (!items || items.length === 0) {
      throw new ExpressError('No items provided for checkout', 400);
    }

    const productIds = items.map(item => item.product);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

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
            createdBy: userId,
            paymentMethod: customer.customerType === 'cash' ? 'cash' : 'credit',
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
      user: req.user._id
    });

  }
  
  // Update Customer totals
  customer.totalPurchased += totalAmount + discount; 
  if (paidAmount > 0) {
      customer.totalPaid += Number(paidAmount);
      customer.lastPaymentDate = new Date();
    }

    const remainingBalance = totalAmount - (paidAmount || 0);
    if (customer.customerType === 'credit' && remainingBalance > 0) {
      customer.currentBalance += remainingBalance;
    }
    
    await customer.save();


    if (paidAmount && paidAmount > 0) {
      await Payment.create({
        sale: sale._id,
        customer: customer._id,
        amount: paidAmount,
        paymentMethod: customer.customerType === 'cash' ? 'cash' : 'credit',
        paymentStatus: 'success',
        recievedBy: userId
      });
    }

 if (typeof emitDashboardRefresh === 'function') {
      emitDashboardRefresh();
    }


// reciept generation
  
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
      paymentMethod: customer.customerType === 'cash' ? 'Cash' : 'Credit'
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

  return res.status(201).json({
    success: true,
    message: "Sale created successfully",
    sale,
    pdfData: pdfBase64Data, 
    fileName: receiptFileName
  });

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
    const saleItemIds = sale.items.map(item => item._id);
    await SaleItem.deleteMany({ _id: { $in: saleItemIds } });

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
    
    // 1. Find Customer Profile
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new ExpressError("Customer is not Found", 404);
    }

    // 2. Fetch Sales - Sorted by Newest First
    const sales = await Sale.find({ customer: customerId })
        .populate({
            path: 'items',
            populate: {
                path: 'product',
                select: 'name productCode' // Deep population frontend inventory view k liye
            }
        })
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

    // 3. Initialize statistics based exactly on your frontend grid layout
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

        // UI matching condition: sale.status === 'Paid'
        if (gross === paid) {
            paidSalesCount++;
        } else {
            pendingSalesCount++;
        }
    });

    // 4. Format Sales Array to perfectly feed into salesData state
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
            // 🔥 CRITICAL: Yeh field aapka UI table map check kar rha hai row.status pr
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

    // 5. Structure JSON matching your exact React state destructuring
    return res.status(200).json({
        success: true,
        message: "Customer sales retrieved successfully",
        // Direct map: setCustomerData(res.data.customerDetails)
        customerDetails: {
            customerId: customer._id,
            customerName: customer.name,
            phoneNumber: customer.phoneNumber || "N/A",
            customerType: customer.customerType || "Walk-in",
            currentBalance: customer.currentBalance || 0,
            lastPaymentDate: customer.lastPaymentDate || null
        },
        // Direct map: setStatistics(res.data.salesStatistics)
        salesStatistics: {
            totalSales: sales.length, // UI: statistics?.totalSales
            paidSales: paidSalesCount,
            pendingSales: pendingSalesCount,
            totalPurchased: totalPurchased, // UI: statistics?.totalPurchased
            totalPaid: totalPaid, // UI: statistics?.totalPaid
            totalPending: Math.max(0, totalPending), // UI: statistics?.totalPending
            averageSaleAmount: sales.length > 0 ? Math.round(totalPurchased / sales.length) : 0
        },
        // Direct map: setSalesData(res.data.data)
        data: formattedSales
    });
};
export const processReturn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

    const { saleId, productId, quantity } = req.body;

    // 1. Find Sale
    const sale = await Sale.findById(saleId)
      .populate("customer")
      .populate("items")
      .session(session);

    if (!sale) {
      throw new ExpressError("Sale not found", 404);
    }

    // 2. Find Sale Item
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

    // 3. Calculate financial values
    const price = saleItem.sellPrice;
    const returnAmount = price * quantity;

    // 4. STOCK RESTORE + LOG
    await updateStock({
      productId,
      change: +quantity,
      type: "Return",
      sale: saleId,
      user: req.user._id,
      session
    });

    // 5. Update/Delete Sale Item
    saleItem.quantity -= quantity;

    if (saleItem.quantity === 0) {
      await SaleItem.findByIdAndDelete(saleItem._id).session(session);

      await Sale.updateOne(
        { _id: saleId },
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

    // 🔥 Variable casing fixed to lowercase "customer" to ensure global reference matching
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

    // 6. Safe Customer update tracking
    if (cashRefundGiven > 0) {
      customer.totalPaid = Math.max(0, (customer.totalPaid || 0) - cashRefundGiven);
    }
    customer.lastPaymentDate = new Date();
    await customer.save({ session });

    // 7. Create Refund Payment Reference Entry
    await Payment.create([{
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