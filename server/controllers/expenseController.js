import Expense from '../models/Expense.js'
import mongoose from 'mongoose';


// create expense api/expense/create
export const createExpense = async (req , res)=> {




   const {category , amount , description,paidBy , paymentMethod ,  date} = req.body;

   let paidById = req.user?._id;
  if (req.user._id === 'admin') {
    paidById = new mongoose.Types.ObjectId(); // Dummy ID
  }

    const expense = await Expense.create({
      category,
      amount,
      description,
      paymentMethod: paymentMethod || 'Cash',
      date: date || new Date(),
      paidBy: paidById
    });

      return res.status(201).json({
      success: true,
      message: "Expense added",
      expense: expense
    })
    }

//   get expense api/expense/list
    export const getExpenses = async(req , res) =>{
       const { month , year} = req.query;
        const monthNum = parseInt(month) || new Date().getMonth() + 1;
        const yearNum = parseInt(year) || new Date().getFullYear();
        
        const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 1);

    const expenses = await Expense.find({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

        let totalExpenses = 0;
        let categoryWise = {}

        expenses.forEach(expense => {
            totalExpenses += expense.amount;
            if(!categoryWise[expense.category]){
             categoryWise[expense.category] = {
            total:0,
            descriptions:[]
            }
            } 
              categoryWise[expense.category].total += expense.amount;
              categoryWise[expense.category].descriptions.push(expense.description);
              categoryWise[expense.category].count += 1; 
            });

    return res.json({
      success: true,
      month: monthNum,
      year: yearNum,
      totalExpenses: totalExpenses,
      totalExpenseCount: expenses.length,
      categoryWise: categoryWise,
      expenses: expenses
    });
         }
