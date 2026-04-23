import Sale from '../models/Sale.js'
import SaleItem from '../models/SaleItem.js';
import Expense from '../models/Expense.js';
import ExpressError from "../utils/expressError.js";



///api/analytics/sales  
export const getSaleChart = async( req , res) =>{
    const {month ,year} = req.query;
    let date = new Date();
    let monthNum = month || date.getMonth()+1;
    let yearNum = year || date.getFullYear();
    let sales = await Sale.find({
        $exp:{
            $and:[
               { $eq:[{$month:"$createdAt"},monthNum]},
               {$eq:[{$yaer:"$createdAt"},yearNum]},
             ]
            }
        })
        //daily sale
        let dailySales={};
        let daysInMonth = new Date (yearNum,monthNum+1,0).getDate()
        for(let i=1 ; i<=daysInMonth;i++){
            dailySales[i]=0
        }
        sales.forEach(sale=>{
            const day = new Date (sale.createdAt).getDate();
            dailySales[day] +=1;
        })

        //weeklysale
        let weeklySales = {1:0,2:0,3:0,4:0,5:0};
        sales.forEach(sale=>{
            const week = Math.ceil((sale.createdAt).getDate()/7)
            weeklySales[week]+=1;
        })

        //monthlySale
        const monthlyTotal = sales.length()
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
}

// Top Sell Product api/analytical/products
export const getTopSellProd = async ( req ,res)=> {

    const {month ,year, limit=10} = req.query;
    const date =  new Date();
     let monthNum = month || date.getMonth()+1;
    let yearNum = year || date.getFullYear();

    const sales = await Sale.find({
      $exp:{
        $and:[
          { $eq:[{$month:"$createdAt"},monthNum]},
          {$eq:[{$yaer:"$createdAt"},yearNum]},
        ]
      }
    })

    const products={};
    for(let sale of sales){
    const items =await SaleItem.findById({saleRef:sale._id})
    .populate('product')
  }

  items.forEach(item=>{
    if(!products[item.product._id]){
      products[item.product._id]={
        productId: item.product._id,
            name: item.product.name,
            quantity: 0,
            revenue: 0
      };
    }
         products[item.product._id].quantity += item.quantity;
        products[item.product._id].revenue += item.totalPrice;
  }) 

  

  Object.key(products).forEach(key=>{
    products[key].avgPrice=(products[key].revenue / products[key].quantity).toFixed(2);
  })

  // Sort by quantity
const topproducts = Object.values(products).
sort((a,b)=>b.quantity - a.quantity)
      .slice(0, parseInt(limit));

      // Total unique products sold
    const totalProducts = Object.keys(products).length;

       return res.json({
      success: true,
      month: monthNum,
      year: yearNum,
      topProducts: topproducts,
      totalProductsSold: Object.keys(products).length,
      totalProducts:totalProducts
    });
}



// Profit api/analytical/profit
export const getProfitChart = async ( req , res)=>{
  const {year} = req.query;
  const yearNum= year || new Date().getFullYear();
  const months = ['jan' , 'feb' , 'march' , 'april' ,'may' ,'june','july','august','sep' ,'oct' ,'nov','dec']
  const monthlyData = {}
for(let month = 1; month <= 12; month++){
// sale
 const sales = await Sale.find({
  $exp:{
    $and:[
      {$eq:[{$month: "createdAt"},month]},
      {$eq:[{$year: "createdAt"},yearNum]}

    ]
  }
 })

 let revenue =0;
 let cogs=0;

 sales.forEach(s=>{revenue+=s.totalAmount})
  
 // COGS calculation
 for (let sale of sales){
  let items = await SaleItem.find({saleRef:sale._id}).populate('product')
  items.forEach(item => {
          cogs += item.quantity * (item.product.costPrice || 0);
        });
 }
  const expenses = await Expense.find({
        $expr: {
          $and: [
            { $eq: [{ $month: "$date" }, month] },
            { $eq: [{ $year: "$date" }, yearNum] },
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
 return res.json({
      success: true,
      year: yearNum,
      monthlyProfitData: monthlyData,
      totalProfit: Object.values(monthlyData).reduce((sum, m) => sum + m.netProfit, 0),
      avgMonthlyProfit: (Object.values(monthlyData).reduce((sum, m) => sum + m.netProfit, 0) / 12).toFixed(2)
    });
}

// total revenue payment method (cash vs credit)
export const getPaymentMethod = async ( req ,res)=>{
  const {month , year} = req.query;
  const date = new Date();
   let monthNum = month || date.getMonth()+1;
    let yearNum = year || date.getFullYear();

    const sales = await Sale.find({
      $exp:{
        $and:[
          { $eq:[{$month:"$createdAt"},monthNum]},
          {$eq:[{$year:"$createdAt"},yearNum]},
        ]
      }
    }).populate('customer')

    const paymentData ={
      cash:{count: 0, revenue: 0, paid: 0, pending: 0},
      credit:{count: 0, revenue: 0, paid: 0, pending: 0}
    }

    sales.forEach(sale=>{
    const type = sale.customer.customerType;
      paymentData[type].count += 1;
      paymentData[type].revenue += sale.totalAmount;
      paymentData[type].paid += sale.paidAmount;
      paymentData[type].pending += (sale.totalAmount - sale.paidAmount);
});
// Calculate collection rate
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
}








