import Customer from "../models/Customer.js";
import Product from "../models/Product.js";
import SaleItem from "../models/SaleItem.js";
import Sale from "../models/Sale.js";
import Payment from "../models/payment.js";
import { inventoryLogChange } from "./inventoryLog.js";
import ExpressError from "../utils/expressError.js";

// api/sale/create
export const createSale = async (req, res) =>{
  const {name ,phoneNumber,items ,customerType,paidAmount } = req.body;
     
    for (let item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new ExpressError('Product not found', 404);
    }

    if (product.quantity < item.quantity) {
      throw new ExpressError('Insufficient stock', 400);
    }
  }
  
  
  let customer = await Customer.findOne({name , phoneNumber})
     if(!customer){
     customer = new Customer({
      name:name,
      phoneNumber:phoneNumber,
      currentBalance: 0,
      lastPaymentDate:null,
      customerType:customerType || 'cash'
     });
    
     await customer.save();
    }

    let totalAmount =0;
    let saleItemIds=[];
    
    for (let item of items){
    let product = await Product.findById(item.product);
    let itemTotal = item.quantity * item.sellPrice
    totalAmount += itemTotal;
    product.quantity-= item.quantity
    await product.save();

   //create saleItem
   let saleItem = await SaleItem.create({
        saleRef:null,
        product:product._id,
        quantity:item.quantity,
        sellPrice:item.sellPrice,
        totalPrice:itemTotal,
    });
    saleItemIds.push(saleItem._id);
 }
  //  Create Sale
 const sale = await Sale.create({
            items: saleItemIds,
            customer: customer._id,
            totalAmount,
            paidAmount: paidAmount || 0,
            createdBy: req.user._id 
        });
        console.log(req.user._id)
 
 
 // create Inventory log for History
 for (let item of items){
 await inventoryLogChange({
    product : item.product,
    quantityChange:-item.quantity,
    type:"Sale",
    sale: sale._id,
    createdBy:req.user._id,
    
  });
 }
 //  Update SaleItems with saleRef
    await SaleItem.updateMany(
    { _id: { $in: saleItemIds } },
    { $set: { saleRef: sale._id } }
);

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
                recievedBy: req.user._id
            });
        }
        return res.status(201).json({
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

  // Update lastPaymentDate
  if (amountToPay > 0) {
    customer.lastPaymentDate = new Date();
  }

  await customer.save();

  // Update sale paidAmount
  sale.paidAmount = newPaidAmount;
  await sale.save();

  // Create payment record
  if (amountToPay > 0) {
    await Payment.create({
      sale: sale._id,
      customer: customer._id,
      amount: amountToPay,  
      paymentMethod: customer.customerType === 'cash' ? 'cash' : 'credit',
      recievedBy: req.user._id
    });
  }

  // Fetch updated sale
  const updatedSale = await Sale.findById(id)
    .populate('customer')
    .populate('items')
    .populate('createdBy');

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

    // Inventory log banao (quantity restore nahi, sirf record)
    for (let item of sale.items) {
        await inventoryLogChange({
            product: item.product,
            quantityChange: 0,          
            type: "Sale Cancellation",
            sale: sale._id,
            createdBy: req.user._id || null,
        });
    }

    // SaleItems delete
    await SaleItem.deleteMany({ _id: { $in: sale.items } });

    // Payments delete
    await Payment.deleteMany({ sale: sale._id });

    // Sale delete
    await Sale.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: "Sale deleted successfully",
        data: {
            customerName: customer.name,
            customerPhone: customer.phoneNumber,
            totalAmountDeleted: sale.totalAmount,
        }
    });
};

// GET SALES BY CUSTOMER  /api/sale/customer/:customerId 
export const getSalesByCustomer = async (req, res) => {
         const { customerId } = req.params;
         const customer = await Customer.findById(customerId);
         if (!customer) {
            throw new ExpressError("Custoomer is not Found" ,404)
        }
        const sales = await Sale.find({ customer: customerId })
            .populate('items')
            .populate('createdBy')
            .sort({ createdAt: -1 });

        // Calculate customer statistics
        let totalPurchased = 0;
        let totalPaid = 0;
        let totalPending = 0;
        let paidSalesCount = 0;
        let pendingSalesCount = 0;

        sales.forEach(sale => {
            totalPurchased += sale.totalAmount;
            totalPaid += sale.paidAmount;
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
            totalAmount: sale.totalAmount,
            paidAmount: sale.paidAmount,
            remainingBalance: sale.totalAmount - sale.paidAmount,
            itemCount: sale.items.length,
            createdDate: sale.createdAt,
            updatedDate: sale.updatedAt,
            createdBy: sale.createdBy.name,
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
                remainingBalance: totalPurchased - totalPaid,
                averageSaleAmount: sales.length > 0 ? Math.round(totalPurchased / sales.length) : 0
            },
            data: formattedSales
        });
};

 
// GET ALL SALES  /api/sale
export const getAllSales = async (req, res) => {
   
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Paginated sales with details
        const sales = await Sale.find()
            .populate('customer')
            .populate('items')
            .populate('createdBy','name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalSales = await Sale.countDocuments();

        // Format sales data
        const formattedSales = sales.map(sale => ({
            saleId: sale._id,
            customerName: sale.customer?.name || 'Unknown',
            customerPhone: sale.customer?.phoneNumber || 'N/A',
            customerType: sale.customer?.customerType || 'N/A',
            totalAmount: sale.totalAmount,
            paidAmount: sale.paidAmount,
            remainingBalance: sale.totalAmount - sale.paidAmount,
            itemCount: sale.items.length,
            createdDate: sale.createdAt,
            createdBy: sale.createdBy || 'Unknown',  
            status: sale.totalAmount === sale.paidAmount ? 'Paid' : 'Pending'
        }));

        return res.status(200).json({
            success: true,
            message: "All sales retrieved successfully",
            pagination: {
                currentPage: pageNum,
                limit: limitNum,
                totalSales: totalSales,
                totalPages: Math.ceil(totalSales / limitNum)
            },
            data: formattedSales  
        });
};



// // GET SALE BY ID api/sale/id
// export const getSaleById = async (req, res) => {
//         const { id } = req.params;
//         const sale = await Sale.findById(id)
//             .populate('customer')
//             .populate('items')
//             .populate('createdBy');

//         if (!sale) {
//             throw new ExpressError("Sale not Found" ,404)
//         }
//         const remainingBalance = sale.totalAmount - sale.paidAmount;

//         return res.status(200).json({
//         success: true,
//         message: "Sale retrieved successfully",
//         data: {
//             sale: sale,
//             saleDetails: {
//                 saleId: sale._id,
//                 totalAmount: sale.totalAmount,
//                 paidAmount: sale.paidAmount,
//                 remainingBalance: remainingBalance,
//                 itemCount: sale.items.length,
//                 createdDate: sale.createdAt,
//                 updatedDate: sale.updatedAt
//             },
//             customerDetails: {
//                 customerId: sale.customer?._id || null,        
//                 customerName: sale.customer?.name || 'Unknown', 
//                 phoneNumber: sale.customer?.phoneNumber || 'N/A', 
//                 customerType: sale.customer?.customerType || 'N/A', 
//                 currentBalance: sale.customer?.currentBalance || 0,  
//                 lastPaymentDate: sale.customer?.lastPaymentDate || null 
//             },
//             createdByDetails: {
//                 userId: sale.createdBy?._id || null,          
//                 userName: sale.createdBy?.name || 'Admin',    
//                 userEmail: sale.createdBy?.email || 'Admin'   
//             }
//         }
//     });
// };


export const processReturn = async(req , res)=>{
    
    const {saleId , productId , quantity , approve}= req.body;
   
       // Find sale 
       const sale = await Sale.findById(saleId)
      .populate('customer')
      .populate('items');

      if (!sale) {
        throw new ExpressError("Sale in not Fond" ,404)
    }
     // Find sale item
     const saleItem = await SaleItem.findOne({
      saleRef: saleId,
      product: productId
    }).populate('product');

      if (!saleItem || saleItem.quantity < quantity) {
        throw new ExpressError("Cannot return more than purchase" ,400)
     }
     
    // Calculate refund
    const price = saleItem.sellPrice;
    const returnAmount = quantity * price;

     //  Restore product stock
    const product = saleItem.product;
    product.quantity += quantity;
    await product.save();

     // STEP 2: Create inventory log
    await inventoryLogChange({
      product: productId,
      quantityChange: +quantity,
      type: "Return",
      sale: saleId,
      createdBy: req.user._id
    });

   //  Update sale item quantity
    saleItem.quantity -= quantity;
    if (saleItem.quantity === 0) {
      // Remove item from sale if all returned
      await SaleItem.findByIdAndDelete(saleItem._id);
      
      // Remove from sale.items array
      await Sale.updateOne(
        { _id: saleId },
        { $pull: { items: saleItem._id } }
      );
    } else {
      await saleItem.save();
    }

  // : Adjust sale total
    const oldSaleTotal = sale.totalAmount;
    sale.totalAmount -= (quantity * price);
    
    // Adjust paid amount (if customer paid for returned items)
    const paidForReturned = (quantity * price * (sale.paidAmount / oldSaleTotal));
    sale.paidAmount -= paidForReturned;
    await sale.save();

    // Process refund
    const customer = sale.customer;
   if (customer.customerType === 'credit') {
      // Reduce balance (refund)
      customer.currentBalance -= returnAmount;
    }
    await customer.save();

    // STEP 6: Create refund payment
    await Payment.create({
      sale: saleId,
      customer: customer._id,
      amount: -returnAmount, // Negative = refund
      paymentMethod: 'Refund',
      recievedBy: req.user._id
    });

    return res.json({
      success: true,
      message: "Return processed successfully",
      data: {
        returnedQuantity: quantity,
        refundAmount: returnAmount,
        newSaleTotal: sale.totalAmount,
        newSalePaid: sale.paidAmount,
        newCustomerBalance: customer.currentBalance
      }
    });
}


    







  