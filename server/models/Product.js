import mongoose from 'mongoose'


const productSchema =  new mongoose.Schema({
    name :{type: String ,   required : true},
    sku : {type : String ,required : true ,  unique : true},
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    costPrice : {type : Number ,required : true},
    sellPrice: { type: Number, default: 0 },
    quantity : {type : Number ,required : true},
    description: {type: String, required: true},
    image : {url : String ,filename: String} ,
    supplier : {type : mongoose.Schema.Types.ObjectId, ref : 'Supplier'},
    unit:{type : String , enum : ['kg' , 'Pcs' ,'ltr']},
    isActive : {type : Boolean ,default : true},
},{timestamps : true})


const Product = mongoose.models.Product || mongoose.model('Product' , productSchema)


export default Product;