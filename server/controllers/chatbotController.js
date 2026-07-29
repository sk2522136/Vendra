import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import getGeminiResponse from '../utils/geminiService.js';
import ExpressError from '../utils/expressError.js';

export const processChatMessage = async (req, res) => {
  try {
    const { message, phoneNumber } = req.body;
    const tenantId = req.tenantId;

    if (!message) {
      throw new ExpressError('Message required', 400);
    }

     //db query
    const [lowStockProducts, allProducts, allSalesAggregation] = await Promise.all([
      Product.find({ tenantId,quantity: { $lt: 10 } }).select('name quantity price'),
      Product.find(tenantId).select('name price quantity description'),
      Sale.aggregate([
        {
           $match: { tenantId 
           }
        },
        
        {
          
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalPaidOverall: { $sum: "$paidAmount" }
          }
        }
      ])
    ]);

   //total revenue, total paid, total credit 
    const totalRevenue = allSalesAggregation[0]?.totalRevenue || 0;
    const totalPaidOverall = allSalesAggregation[0]?.totalPaidOverall || 0;
    const totalCreditMarket = totalRevenue - totalPaidOverall;

  //specific customer context
    let customerInfo = "";
    if (message || phoneNumber) {
      let customerQuery = {};
      if (phoneNumber) {
        customerQuery = { phoneNumber: phoneNumber, tenantId };
      } else {
        customerQuery = { 
          tenantId,
          $or: [
            { name: { $regex: message, $options: 'i' } },
            { phoneNumber: { $regex: message, $options: 'i' } }
          ]
        };
      }

      const customer = await Customer.findOne(customerQuery);
      
      if (customer) {
        const customerSales = await Sale.find({ customer: customer._id, tenantId });
        const cPurchased = customerSales.reduce((sum, s) => sum + s.totalAmount, 0);
        const cPaid = customerSales.reduce((sum, s) => sum + s.paidAmount, 0);
        const pending = cPurchased - cPaid;

        customerInfo = `
      === SEARCHED CUSTOMER CONTEXT ===
      Customer Name: ${customer.name}
      Phone: ${customer.phoneNumber}
      Current Credit Balance: Rs ${pending}
      Total Purchased: Rs ${cPurchased}
      Total Paid: Rs ${cPaid}
      Last Payment: ${customer.lastPaymentDate ? new Date(customer.lastPaymentDate).toLocaleDateString() : 'Never'}
      Customer Type: ${customer.customerType}
      `;
      }
    }

  // old customers with pending credit balances
    const creditCustomersSummary = await Sale.aggregate([
     
        {
          $match: { tenantId }
       },

 {
        $group: {
          _id: "$customer",
          totalPurchased: { $sum: "$totalAmount" },
          totalPaid: { $sum: "$paidAmount" }
        }
      },
      {
        $project: {
          customer: "$_id",
          pending: { $subtract: ["$totalPurchased", "$totalPaid"] }
        }
      },
      {
        $match: { pending: { $gt: 0 } }
      },
      {
        $lookup: {
          from: "customers", 
          localField: "customer",
          foreignField: "_id",
          as: "details"
        }
      },
      { $unwind: "$details" },
      { $match: { "details.customerType": "credit" } },
      { $sort: { "details.createdAt": 1 } },
      { $limit: 5 }
    ]);

    // Format 
    let oldCreditCustomers = "Old Credit Customers (Sorted by oldest):\n";
    if (creditCustomersSummary.length > 0) {
      oldCreditCustomers += creditCustomersSummary.map(c => 
        `${c.details.name} (${c.details.phoneNumber}): Rs ${c.pending} pending`
      ).join('\n');
    } else {
      oldCreditCustomers += "No active pending credit balances detected.";
    }

    const productDetails = allProducts.map(p => 
      `${p.name} - Rs ${p.price}/unit (Stock: ${p.quantity})`
    ).join(', ');

    let context = `
      === LOW STOCK PRODUCTS ===
      ${lowStockProducts.map(p => `${p.name}: ${p.quantity} units left (Rs ${p.price})`).join('\n')}

      === PRODUCT DETAILS ===
      ${productDetails}

      === TOTAL REVENUE ===
      Total Sales: Rs ${totalRevenue}
      Total Paid: Rs ${totalPaidOverall}
      Total Credit in Market: Rs ${totalCreditMarket}

      === OLD CREDIT CUSTOMERS ===
      ${oldCreditCustomers}
      ${customerInfo}
      `;

    const aiResponse = await getGeminiResponse(message, context);

    if (!aiResponse.success) {
      throw new ExpressError(aiResponse.error, 500);
    }

    res.status(200).json({
      success: true,
      message: aiResponse.message
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
};