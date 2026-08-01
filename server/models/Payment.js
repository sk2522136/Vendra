import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    tenantId: { type :mongoose.Schema.Types.ObjectId, ref: 'Organization',required: true  },
    customer: {type: mongoose.Schema.Types.ObjectId,ref: 'Customer'},
    amount: {type: Number,required: true},
    sale: {type: mongoose.Schema.Types.ObjectId,ref: 'Sale',required: true},
    paymentMethod: {type: String,enum: ['cash', 'credit', 'card'],default: 'cash'},
    paymentStatus: {type: String,enum: ['pending', 'success', 'failed','refunded'],default: 'pending'},
    transactionId: {type: String,sparse: true},
    stripePaymentIntentId: {type: String,sparse: true},
    errorMessage: {type: String},
    recievedBy: {type: mongoose.Schema.Types.ObjectId,ref: 'User'},
    notes: {type: String},
    receiptNumber: {type: String,sparse: true}
}, {timestamps: true});


paymentSchema.index({ tenantId: 1 });
paymentSchema.index({ tenantId: 1, createdAt: -1 });
paymentSchema.index({ tenantId: 1, sale: 1 });
paymentSchema.index({ tenantId: 1, customer: 1 });
paymentSchema.index({ tenantId: 1, paymentMethod: 1 });
paymentSchema.index({ tenantId: 1, paymentStatus: 1 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema)

export default Payment;