import mongoose from 'mongoose'

const saleSchema =  new mongoose.Schema({
    items: [{type :mongoose.Schema.Types.ObjectId , ref : 'SaleItem' }],
    customer : { type : mongoose.Schema.Types.ObjectId,ref:'Customer'},
    totalAmount:{type:Number , required:true},
    paidAmount:{type:Number , required:true},
    createdBy:{type:mongoose.Schema.Types.ObjectId , ref:'User'},
},{timestamps:true})

const Sale = mongoose.models.Sale || mongoose.model('Sale' ,saleSchema);

export default Sale;