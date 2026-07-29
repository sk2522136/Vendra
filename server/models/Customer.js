import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
      tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization',
    required: true  // Har customer ke liye zaroori
  },
    name: { type: String,  required: true },
    phoneNumber: { type: String, required: true  },
    currentBalance: { type: Number, default: 0 },
    lastPaymentDate: { type: Date },
    customerType: { type: String, enum: ['cash', 'credit', 'card'],default: 'cash' },
    isActive: { type: Boolean, default: true },
    totalPurchased: {type: Number,default: 0},
    totalPaid: {type: Number,default: 0},
    notes: {type: String}
}, { timestamps: true })

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema)

customerSchema.index({ tenantId: 1 });
customerSchema.index({ tenantId: 1, phoneNumber: 1 });
customerSchema.index({ tenantId: 1, createdAt: -1 });
customerSchema.index({ tenantId: 1, isActive: 1 });

export default Customer;