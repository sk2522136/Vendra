import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    name : {type : String , required : true},
    contact :{type :String , required : true},
    totalPurchase : {type : Number , default : 0},
    paidAmount : {type : Number , default : 0},
    unpaidAmount : {type :Number , default : 0},
    isActive : {type : Boolean , default : true}
})


const Supplier = mongoose.models.Supplier || mongoose.model('Supplier' , supplierSchema)

export default Supplier;