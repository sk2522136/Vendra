import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    sale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sale',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'credit', 'card', 'online', 'refund'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        sparse: true
    },
    stripePaymentIntentId: {
        type: String,
        sparse: true
    },
   
    errorMessage: {
        type: String
    },
    recievedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String
    },
    receiptNumber: {
        type: String,
        sparse: true
    }
}, {timestamps: true});

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema)

export default Payment;