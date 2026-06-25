import mongoose from 'mongoose'

const saleSchema = new mongoose.Schema({
    items: [{type: mongoose.Schema.Types.ObjectId, ref: 'SaleItem'}],
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer'},
    totalAmount: {type: Number, required: true},
    paidAmount: {type: Number, required: true},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    paymentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Payment'},
    paymentMethod: {type: String,enum: ['cash', 'credit', 'card', 'online'],default: 'cash'},
    paymentStatus: {type: String,enum: ['pending', 'success', 'failed'],default: 'pending'},
    receiptNumber: {type: String,unique: true,sparse: true},
    receiptGenerated: {type: Boolean,default: false},
    stripePaymentIntentId: {type: String,sparse: true},
    discount: {type: Number,default: 0},
    notes: {type: String},
    
}, {timestamps: true})

const Sale = mongoose.models.Sale || mongoose.model('Sale', saleSchema);

export default Sale;