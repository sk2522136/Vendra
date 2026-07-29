import Sale from '../models/Sale.js'
import SaleItem from '../models/SaleItem.js';
import Expense from '../models/Expense.js';
import ExpressError from "../utils/expressError.js";

//  /api/analytical/sale
export const getSaleChart = async(req, res) => {
    try {
        const { month, year } = req.query;
        const tenantId = req.tenantId;
        const date = new Date();
        const monthNum = parseInt(month) || date.getMonth() + 1;
        const yearNum = parseInt(year) || date.getFullYear();

       const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 1);

        const sales = await Sale.find({
            tenantId: req.tenantId,
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        });

        // Daily sales
        const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
        const dailySales = {};
        
        for (let i = 1; i <= daysInMonth; i++) {
            dailySales[i] = 0;
        }

        // Weekly sales and daily sales
        const weeklySales = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        sales.forEach(sale => {
            const saleDate = new Date(sale.createdAt);
            const day = saleDate.getDate();
            
            // Daily sale 
            dailySales[day]++;

            // Weekly sale
            let week = Math.ceil(day / 7);
            if (week > 5) week = 5; 
            weeklySales[week]++;
        });

        // Monthly stats
        const monthlyTotal = sales.length;
        const avgDailySales = (monthlyTotal / daysInMonth).toFixed(2);

        return res.json({
            success: true,
            month: monthNum,
            year: yearNum,
            daily: dailySales,
            weekly: weeklySales,
            monthly: {
                total: monthlyTotal,
                average: parseFloat(avgDailySales)
            }
        });
    } catch (error) {
        throw new ExpressError(error.message, 500);
    }
};

// get : /api/analytical/products
export const getTopSellProd = async(req, res) => {
    try {
        const { month, year, limit = 10 } = req.query;
        const tenantId = req.tenantId;
        const date = new Date();
        const monthNum = parseInt(month) || date.getMonth() + 1;
        const yearNum = parseInt(year) || date.getFullYear();

        const startDate = new Date(yearNum, monthNum - 1, 1); 
        const endDate = new Date(yearNum, monthNum, 1);       

            const sales = await Sale.find({
                tenantId: req.tenantId,
                createdAt: {
                    $gte: startDate, 
                    $lt: endDate    
                }
            }).limit(parseInt(limit)); 
       
    
     const products = {};

        for (let sale of sales) {
            const items = await SaleItem.find({ saleRef: sale._id }).populate('product');
            
            items.forEach(item => {
                if (!products[item.product._id]) {
                    products[item.product._id] = {
                        productId: item.product._id,
                        name: item.product.name,
                        quantity: 0,
                        revenue: 0
                    };
                }
                products[item.product._id].quantity += item.quantity;
                products[item.product._id].revenue += item.totalPrice;
            });
        }

        Object.keys(products).forEach(key => {
            products[key].avgPrice = (products[key].revenue / products[key].quantity).toFixed(2);
        });

        const topProducts = Object.values(products)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, parseInt(limit));

        return res.json({
            success: true,
            month: monthNum,
            year: yearNum,
            topProducts: topProducts,
            totalProductsSold: Object.keys(products).length
        });
    } catch (error) {
        throw new ExpressError(error.message, 500);
    }
};

//  /api/analytical/profit
export const getProfitChart = async (req, res, next) => {
    try {
        const { year } = req.query;
        const tenantId = req.tenantId;
        const yearNum = parseInt(year) || new Date().getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const startDate = new Date(yearNum, 0, 1);
        const endDate = new Date(yearNum + 1, 0, 1);

             // Monthly Revenue
        const salesRevenueData = await Sale.aggregate([
            { 
                $match: {
                    tenantId: req.tenantId, 
                createdAt: { 
                    $gte: startDate, $lt: endDate 
                } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            }
        ]);

        //  Monthly COGS 
        const cogsData = await SaleItem.aggregate([
            {
                $lookup: {
                    from: "sales",
                    localField: "saleRef",
                    foreignField: "_id",
                    as: "sale"
                }
            },
            { $unwind: "$sale" },
            { $match: {
                 "sale.tenantId": req.tenantId,
                 "sale.createdAt": { $gte: startDate, $lt: endDate } } },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "prod"
                }
            },
            { $unwind: { path: "$prod", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $month: "$sale.createdAt" },
                    totalCogs: { $sum: { $multiply: ["$quantity", { $ifNull: ["$prod.costPrice", 0] }] } }
                }
            }
        ]);

        //  Calculate Expenses
        const expensesData = await Expense.aggregate([
            { $match: {
                tenantId: req.tenantId, 
                date: { $gte: startDate, $lt: endDate } } },
            {
                $group: {
                    _id: { $month: "$date" },
                    totalExpenses: { $sum: "$amount" }
                }
            }
        ]);

        //  12 Months Object Structure
        const monthlyData = {};
        for (let i = 1; i <= 12; i++) {
            monthlyData[i] = { month: months[i - 1], revenue: 0, cogs: 0, grossProfit: 0, expenses: 0, netProfit: 0, profitMargin: 0 };
        }

        // Map Revenue
        salesRevenueData.forEach(item => {
            if (monthlyData[item._id]) {
                monthlyData[item._id].revenue = item.totalRevenue;
            }
        });

        // Map COGS
        cogsData.forEach(item => {
            if (monthlyData[item._id]) {
                monthlyData[item._id].cogs = item.totalCogs;
                monthlyData[item._id].grossProfit = monthlyData[item._id].revenue - item.totalCogs;
            }
        });

        // Map Expenses
        expensesData.forEach(item => {
            if (monthlyData[item._id]) {
                monthlyData[item._id].expenses = item.totalExpenses;
            }
        });

        //  Net Profit 
        let totalProfit = 0;
        Object.keys(monthlyData).forEach(m => {
            const data = monthlyData[m];
            data.netProfit = data.grossProfit - data.expenses;
            data.profitMargin = data.revenue > 0 ? parseFloat(((data.netProfit / data.revenue) * 100).toFixed(2)) : 0;
            totalProfit += data.netProfit;
        });

        return res.json({
            success: true,
            year: yearNum,
            monthlyProfitData: monthlyData,
            totalProfit,
            avgMonthlyProfit: parseFloat((totalProfit / 12).toFixed(2))
        });
    } catch (error) {
        next(error);
    }
};


// /api/analytical/payment
export const getPaymentMethod = async(req, res) => {
    try {
        const { month, year } = req.query;
        const tenantId = req.tenantId;

        const date = new Date();
        const monthNum = parseInt(month) || date.getMonth() + 1;
        const yearNum = parseInt(year) || date.getFullYear();

        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 1);

        const sales = await Sale.find({
            tenantId: req.tenantId,
            createdAt: { $gte: startDate, $lt: endDate }
        }).populate('customer');

        const paymentData = {
            cash: { count: 0, revenue: 0, paid: 0, pending: 0 },
            credit: { count: 0, revenue: 0, paid: 0, pending: 0 }
        };

        sales.forEach(sale => {
            let type = sale.customer?.customerType || 'cash';
            
            if (type !== 'cash' && type !== 'credit') {
                type = 'cash'; 
            }

            paymentData[type].count += 1;
            paymentData[type].revenue += sale.totalAmount || 0;
            paymentData[type].paid += sale.paidAmount || 0;
            paymentData[type].pending += ((sale.totalAmount || 0) - (sale.paidAmount || 0));
        });

        // Collection rate
        ['cash', 'credit'].forEach(type => {
            paymentData[type].collectionRate = paymentData[type].revenue > 0
                ? parseFloat(((paymentData[type].paid / paymentData[type].revenue) * 100).toFixed(2))
                : 0;
        });

        return res.json({
            success: true,
            month: monthNum,
            year: yearNum,
            cash: paymentData.cash,
            credit: paymentData.credit,
            totalRevenue: paymentData.cash.revenue + paymentData.credit.revenue,
            totalPaid: paymentData.cash.paid + paymentData.credit.paid,
            totalPending: paymentData.cash.pending + paymentData.credit.pending
        });
    } catch (error) {
        throw new ExpressError(error.message, 500);
    }
};