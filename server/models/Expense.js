import mongoose from 'mongoose'

const expenseSchema = mongoose.Schema({
    category:{
        type:String,
        enum:['Salary', 'Rent', 'Utilities', 'Maintenance'],
        required:true
    },

    amount: {
    type: Number,
    required: true
  },
   description:{type:String , required:true},
   paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

   paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Check'],
    default: 'Cash'
  },

  date: {
    type: Date,
    default: Date.now
  },

},{ timestamps: true })


const Expense = mongoose.models.Expense || mongoose.model("Expense" , expenseSchema )

export default Expense;