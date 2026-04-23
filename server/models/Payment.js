import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    customer:{type:mongoose.Schema.Types.ObjectId,ref:'Customer'},
    amount:{type:Number,required:true},
    sale:{type:mongoose.Schema.Types.ObjectId , ref:'Sale'},
    paymentMethod:{type:String , enum:['cash' , 'credit' , 'Refund'],default:'cash'},
    recievedBy:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
},{timestamps:true});


const Payment = mongoose.models.Payment || mongoose.model('Payment' , paymentSchema )

export default Payment;