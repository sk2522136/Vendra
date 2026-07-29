import mongoose from 'mongoose';

const organizationSchema = mongoose.Schema({
  name: { type: String, required: true,trim: true },
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
  subscriptionPlan: { type: String, enum: ['free', 'pro'], default: null},
  subscriptionStatus: { type: String,  enum: [  'pending','active', 'cancelled', 'expired'], default: 'pending'},
  subscriptionAmount: { type: Number, default: 0 },
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  status: { type: String,enum: ['active', 'inactive', 'suspended'], default: 'active' },
  maxUsers: { type: Number, default: 100 },
  maxProducts: { type: Number,  default: 10000 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: {  type: Date, default: Date.now }
});

organizationSchema.index({ ownerUserId: 1 });
organizationSchema.index({ subscriptionStatus: 1 });
organizationSchema.index({ subscriptionPlan: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;