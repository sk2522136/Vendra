import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import getGeminiResponse from '../utils/geminiService.js';
import ExpressError from '../utils/expressError.js';

export const processChatMessage = async (req, res) => {
  try {
    const { message, phoneNumber } = req.body;

    if (!message) {
      throw new ExpressError('Message required', 400);
    }

    // 1. Parallel Independent DB Queries (Fast Processing)
    const [lowStockProducts, allProducts, allSalesAggregation] = await Promise.all([
      Product.find({ quantity: { $lt: 10 } }).select('name quantity price'),
      Product.find().select('name price quantity description'),
      Sale.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalPaidOverall: { $sum: "$paidAmount" }
          }
        }
      ])
    ]);

    // 2. Extract Overall Revenue Totals
    const totalRevenue = allSalesAggregation[0]?.totalRevenue || 0;
    const totalPaidOverall = allSalesAggregation[0]?.totalPaidOverall || 0;
    const totalCreditMarket = totalRevenue - totalPaidOverall;

    // 3. Dynamic Customer Search Context Logic
    let customerInfo = "";
    if (message || phoneNumber) {
      let customerQuery = {};
      if (phoneNumber) {
        customerQuery = { phoneNumber: phoneNumber };
      } else {
        customerQuery = { 
          $or: [
            { name: { $regex: message, $options: 'i' } },
            { phoneNumber: { $regex: message, $options: 'i' } }
          ]
        };
      }

      const customer = await Customer.findOne(customerQuery);
      
      if (customer) {
        const customerSales = await Sale.find({ customer: customer._id });
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

    // 4. 🔥 MONGO AGGREGATION: Saare Credit Customers ka Data Single Query mein Fetch (No loops!)
    const creditCustomersSummary = await Sale.aggregate([
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
          from: "customers", // Make sure this matches your MongoDB collection name for Customers
          localField: "customer",
          foreignField: "_id",
          as: "details"
        }
      },
      { $unwind: "$details" },
      { $match: { "details.customerType": "credit" } },
      { $sort: { "details.createdAt": 1 } }, // Oldest customers first
      { $limit: 5 } // Only pass Top 5 oldest credit data to AI context
    ]);

    // Format Old Credit Customers
    let oldCreditCustomers = "Old Credit Customers (Sorted by oldest):\n";
    if (creditCustomersSummary.length > 0) {
      oldCreditCustomers += creditCustomersSummary.map(c => 
        `${c.details.name} (${c.details.phoneNumber}): Rs ${c.pending} pending`
      ).join('\n');
    } else {
      oldCreditCustomers += "No active pending credit balances detected.";
    }

    // Format Product Details Matrix
    const productDetails = allProducts.map(p => 
      `${p.name} - Rs ${p.price}/unit (Stock: ${p.quantity})`
    ).join(', ');

    // 5. ASSEMBLE CLEAN AI KNOWLEDGE CONTEXT
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

    // 6. Get Dynamic Gemini Framework Response
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