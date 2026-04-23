import Product from '../models/Product.js';
import {v2 as cloudinary} from 'cloudinary'; 
import { filterProducts , getPaginatedProducts , getSortProducts } from '../utils/helperQuery.js';
import ExpressError from "../utils/expressError.js";


// Create Product : /api/product/create
export const createProduct = async (req, res) => {
    const {name, sku, category, costPrice, quantity, description, supplier, unit, imageUrl} = req.body
    
    let imageurl, filename;
    
    // Cloudinary file upload
    if (req.file) {
        imageurl = req.file.path;        // ← multer-cloudinary direct url deta hai
        filename = req.file.filename;    // ← aur filename bhi
    }
    // Direct link se save ← test ke liye
    else if (imageUrl) {
        imageurl = imageUrl;
        filename = imageUrl.split('/').pop()
    }
        
    const existingSku = await Product.findOne({sku})
    if (existingSku) {
        throw new ExpressError('Product of this sku already exits', 409);
    }

    const newProduct = new Product({
        name,
        sku,
        category,
        costPrice,
        quantity,
        description,
        supplier,
        unit,
        image: {url: imageurl, filename: filename}
    })
    await newProduct.save();
    return res.status(201).json({message: 'Product created successfully', product: newProduct})
}

// get : /api/product/all  Get all Products
export const getAllProducts = async (req , res) => {
        const filter = filterProducts(req);
        const { limit ,skip } =  getPaginatedProducts(req);
        const {sortBy , sortorder} =  getSortProducts(req );
        const products = await Product.find(filter).sort({[sortBy]: sortorder}).skip(skip).limit(limit);
        const total = await Product.countDocuments(filter);
        return res.status(200).json({message : 'Products retrieved successfully' , products , total})
}

//get:/api/product/:id      Get product by id
export const getProductById = async (req , res ) => {
        const {id} =  req.params;
        const product = await Product.findById(id);
        if(!product){
            throw new ExpressError('Product Not found', 404);
        }
       return res.status(200).json({success:true, message : 'Product retrieved successfully' , product})
}

// Update Product : /api/product/:id
export const updateProduct = async (req , res ) => {
        const {id} = req.params;
        const updateProduct =  await Product.findById(id)
        if(!updateProduct){
            throw new ExpressError('Product Not found', 404);
        }
        // for partial update
        const allowedFields = ["name" ,"sku" ,"category" ,"sellPrice" ,"costPrice" ,"quantity" ,"description" ,"supplier" ,"unit"]
        allowedFields.forEach(field => {
            if(req.body?.[field] !== undefined){
                updateProduct[field] = req.body[field]
            }
        });
        //destroyee the existing image from cloudinary
         if (req.file) {
            if (updateProduct.image?.filename) {
            await cloudinary.uploader.destroy(updateProduct.image.filename, {
            resource_type: 'image'
        });
    }
    //upload the new image to cloudinary
    let result = await cloudinary.uploader.upload(req.file.path,{
        resource_type:  'image'
    })
    updateProduct.image = {url : result.secure_url, filename: result.public_id}
}
await updateProduct.save();
return res.status(200).json({message : 'Product updated successfully' , product : updateProduct})
}

// Delete Product : /api/product/:id
export const deleteProduct = async (req , res ) => {
        const {id} = req.params;
        const product = await Product.findById(id);
        if(!product){
            throw new ExpressError('Product Not found', 404);
        }
       if(req.query.hard === 'true'){
         if (product.image?.filename) {
            await cloudinary.uploader.destroy(product.image.filename,{ resource_type: 'image' });
            }
          const deletedProduct=await Product.findByIdAndDelete(id);
          return res.status(200).json({success:true,message : 'Product deleted permanently',deletedProduct})
       }else{
         if (!product.isActive) {
            throw new ExpressError('Product has already deleted', 400);
            }
        product.isActive = false;
        await product.save();
        return res.status(200).json({success:true,message : 'Product deleted successfully' , product})
       }
}