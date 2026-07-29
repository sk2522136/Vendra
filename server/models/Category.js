import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId,ref: 'Organization',required: true},
    name :{type:String ,required : true, trim: true},
    isActive : {type :Boolean ,default : true}
    
},{ timestamps: true })

categorySchema.index({ tenantId: 1 });
categorySchema.index({ tenantId: 1, isActive: 1 });


const Category = mongoose.models.Category || mongoose.model('Category' , categorySchema)

export default Category;