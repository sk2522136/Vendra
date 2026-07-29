import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
    tenantId: {  type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true},
    name : {type : String , required : true},
    contact :{type :String , required : true},
    totalPurchase : {type : Number , default : 0},
    paidAmount : {type : Number , default : 0},
    unpaidAmount : {type :Number , default : 0},
    isActive : {type : Boolean , default : true}
})

supplierSchema.index({ tenantId: 1 });
supplierSchema.index({ tenantId: 1, isActive: 1 });

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier' , supplierSchema)

export default Supplier;