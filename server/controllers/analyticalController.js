import Sale from '../models/Sale.js'
import SaleItem from '../models/SaleItem.js';
import Expense from '../models/Expense.js';
import ExpressError from "../utils/expressError.js";

//  GET SALE CHART - /api/analytical/sale
export const getSaleChart = async(req, res) => {
    try {
        const { month, year } = req.query;
        const date = new Date();
        const monthNum = parseInt(month) || date.getMonth() + 1;
        const yearNum = parseInt(year) || date.getFullYear();

        //  FIXED: $expr syntax
        const sales = await Sale.find({
            $expr: {
                $and: [
                    { $eq: [{ $month: "$createdAt" }, monthNum] },
                    { $eq: [{ $year: "$createdAt" }, yearNum] }
                ]
            }
        });

        // Daily sales
        const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
        const dailySales = {};
        
        for (let i = 1; i <= daysInMonth; i++) {
            dailySales[i] = 0;
        }

        sales.forEach(sale => {
            const day = new Date(sale.createdAt).getDate();
            dailySales[day]++;
        });

        // Weekly sales
        const weeklySales = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        sales.forEach(sale => {
            const week = Math.ceil(new Date(sale.createdAt).getDate() / 7);
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
                average: avgDailySales
            }
        });
    } catch (error) {
        throw new ExpressError(error.message, 500);
    }
};

//  TOP SELLING PRODUCTS - /api/analytical/products
export const getTopSellProd = async(req, res) => {
    try {
        const { month, year, limit = 10 } = req.query;
        const date = new Date();
        const monthNum = parseInt(month) || date.getMonth() + 1;
        const yearNum = parseInt(year) || date.getFullYear();

        const sales = await Sale.find({
            $expr: {
                $and: [
                    { $eq: [{ $month: "$createdAt" }, monthNum] },
                    { $eq: [{ $year: "$createdAt" }, yearNum] }
                ]
            }
        });

        const products = {};

        //  FIXED: SaleItem.find() na SaleItem.findById()
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

        //  FIXED: Object.keys() na Object.key()
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

//  PROFIT CHART - /api/analytical/profit
export const getProfitChart = async(req, res) => {
    try {
        const { year } = req.query;
        const yearNum = parseInt(year) || new Date().getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = {};

        for (let month = 1; month <= 12; month++) {
            const sales = await Sale.find({
                $expr: {
                    $and: [
                        { $eq: [{ $month: "$createdAt" }, month] },
                        { $eq: [{ $year: "$createdAt" }, yearNum] }
                    ]
                }
            });

            let revenue = 0;
            let cogs = 0;

            sales.forEach(s => {
                revenue += s.totalAmount;
            });

            //  COGS calculation
            for (let sale of sales) {
                const items = await SaleItem.find({ saleRef: sale._id }).populate('product');
                items.forEach(item => {
                    cogs += item.quantity * (item.product.costPrice || 0);
                });
            }

            // Expenses
            const expenses = await Expense.find({
                $expr: {
                    $and: [
                        { $eq: [{ $month: "$date" }, month] },
                        { $eq: [{ $year: "$date" }, yearNum] }
                    ]
                }
            });

            let totalExpenses = 0;
            expenses.forEach(exp => totalExpenses += exp.amount);

            const grossProfit = revenue - cogs;
            const netProfit = grossProfit - totalExpenses;

            monthlyData[month] = {
                month: months[month - 1],
                revenue: revenue,
                cogs: cogs,
                grossProfit: grossProfit,
                expenses: totalExpenses,
                netProfit: netProfit,
                profitMargin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(2) : 0
            };
        }

        const totalProfit = Object.values(monthlyData).reduce((sum, m) => sum + m.netProfit, 0);
        const avgMonthlyProfit = (totalProfit / 12).toFixed(2);

        return res.json({
            success: true,
            year: yearNum,
            monthlyProfitData: monthlyData,
            totalProfit: totalProfit,
            avgMonthlyProfit: avgMonthlyProfit
        });
    } catch (error) {
        throw new ExpressError(error.message, 500);
    }
};

//  PAYMENT METHOD - /api/analytical/payment
export const getPaymentMethod = async(req, res) => {
    try {
        const { month, year } = req.query;
        const date = new Date();
        const monthNum = parseInt(month) || date.getMonth() + 1;
        const yearNum = parseInt(year) || date.getFullYear();

        const sales = await Sale.find({
            $expr: {
                $and: [
                    { $eq: [{ $month: "$createdAt" }, monthNum] },
                    { $eq: [{ $year: "$createdAt" }, yearNum] }
                ]
            }
        }).populate('customer');

        const paymentData = {
            cash: { count: 0, revenue: 0, paid: 0, pending: 0 },
            credit: { count: 0, revenue: 0, paid: 0, pending: 0 }
        };

        sales.forEach(sale => {
            const type = sale.customer.customerType;
            paymentData[type].count += 1;
            paymentData[type].revenue += sale.totalAmount;
            paymentData[type].paid += sale.paidAmount;
            paymentData[type].pending += (sale.totalAmount - sale.paidAmount);
        });

        // Collection rate
        paymentData.cash.collectionRate = paymentData.cash.revenue > 0
            ? ((paymentData.cash.paid / paymentData.cash.revenue) * 100).toFixed(2)
            : 0;

        paymentData.credit.collectionRate = paymentData.credit.revenue > 0
            ? ((paymentData.credit.paid / paymentData.credit.revenue) * 100).toFixed(2)
            : 0;

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