import mongoose from 'mongoose'

const saleItemSchema = new mongoose.Schema({
    saleRef:{type :mongoose.Schema.Types.ObjectId , ref : 'Sale'}, 
    product:{type :mongoose.Schema.Types.ObjectId , ref : 'Product' },
    quantity:{type:Number , required:true},
    sellPrice: { type: Number, required: true },  
    totalPrice: { type: Number, required: true }  
},{timestamps:true})

const SaleItem = mongoose.models.SaleItem || mongoose.model('SaleItem' ,saleItemSchema)

export default SaleItem;