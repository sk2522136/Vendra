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

    // ===== 1. LOW STOCK PRODUCTS =====
    const lowStockProducts = await Product.find({ quantity: { $lt: 10 } })
      .select('name quantity price');

    // ===== 2. CUSTOMER INFO =====
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
        const sales = await Sale.find({ customer: customer._id });
        const totalPurchased = sales.reduce((sum, s) => sum + s.totalAmount, 0);
        const totalPaid = sales.reduce((sum, s) => sum + s.paidAmount, 0);
        const pending = totalPurchased - totalPaid;

        customerInfo = `
        Customer Name: ${customer.name}
        Phone: ${customer.phoneNumber}
        Current Credit Balance: Rs ${pending}
        Total Purchased: Rs ${totalPurchased}
        Total Paid: Rs ${totalPaid}
        Last Payment: ${customer.lastPaymentDate ? new Date(customer.lastPaymentDate).toLocaleDateString() : 'Never'}
        Customer Type: ${customer.customerType}
        `;
            }
            }



    

    // ===== 3. OLD CREDIT CUSTOMERS =====
    const allCustomers = await Customer.find({ customerType: 'credit' });
    let oldCreditCustomers = "Old Credit Customers (Sorted by oldest):\n";
    
    const creditList = [];
    for (let cust of allCustomers) {
      const sales = await Sale.find({ customer: cust._id });
      const totalPurchased = sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const totalPaid = sales.reduce((sum, s) => sum + s.paidAmount, 0);
      const pending = totalPurchased - totalPaid;

      if (pending > 0) {
        creditList.push({
          name: cust.name,
          phone: cust.phoneNumber,
          pending: pending,
          lastPayment: cust.lastPaymentDate,
          createdAt: cust.createdAt
        });
      }
    }

    creditList.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    oldCreditCustomers += creditList.slice(0, 5).map(c => 
      `${c.name} (${c.phone}): Rs ${c.pending} pending`
    ).join('\n');

    // ===== 4. PRODUCT DETAILS =====
    const allProducts = await Product.find().select('name price quantity description');
    const productDetails = allProducts.map(p => 
      `${p.name} - Rs ${p.price}/unit (Stock: ${p.quantity})`
    ).join(', ');

    // ===== 5. TOTAL REVENUE =====
    const allSales = await Sale.find();
    const totalRevenue = allSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPaidOverall = allSales.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalCreditMarket = totalRevenue - totalPaidOverall;

    // ===== CREATE CONTEXT =====
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

    // Get AI response
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