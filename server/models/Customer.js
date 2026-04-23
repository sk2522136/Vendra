import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    currentBalance: { type: Number, default: 0 },  
    lastPaymentDate: { type: Date },               
    customerType: { type: String, enum: ['cash', 'credit'], default: 'cash' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true })

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema)

export default Customer;