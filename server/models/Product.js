import mongoose from 'mongoose'


const productSchema =  new mongoose.Schema({
    tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Organization',
    required: true  
  },
  
    name :{type: String ,   required : true},
    sku : {type : String ,required : true ,  unique : true},
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    costPrice : {type : Number ,required : true},
    quantity : {type : Number ,required : true},
    description: {type: String, required: true},
    image : {url : String ,filename: String} ,
    supplier : {type : mongoose.Schema.Types.ObjectId, ref : 'Supplier'},
    unit:{type : String , enum : ['kg' , 'Pcs' ,'ltr']},
    isActive : {type : Boolean ,default : true},
},{timestamps : true})

productSchema.index({ tenantId: 1 });
productSchema.index({ tenantId: 1, productCode: 1 });
productSchema.index({ tenantId: 1, category: 1 });
productSchema.index({ tenantId: 1, isActive: 1 });
productSchema.index({ tenantId: 1, createdAt: -1 });



const Product = mongoose.models.Product || mongoose.model('Product' , productSchema)


export default Product;