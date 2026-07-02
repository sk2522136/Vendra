import Product from '../models/Product.js';
import {v2 as cloudinary} from 'cloudinary'; 
import { filterProducts , getPaginatedProducts , getSortProducts } from '../utils/helperQuery.js';
import ExpressError from "../utils/expressError.js";
import { inventoryLogChange } from "./inventoryLog.js";
import { io } from '../server.js';
import { checkStockAlert } from '../utils/checkStockAlert.js';


// Create Product : /api/product/create
export const createProduct = async (req, res) => {
  
    const {name, sku, category, costPrice, quantity, description, supplier, unit, imageUrl} = req.body
     const trimmedUnit = unit ? unit.trim() : 'ltr'; // Agar missing ho to default 'ltr'
    
    // Allowed units jo aapke model/schema ke enum me hain
    const allowedUnits = ['kg', 'Pcs', 'ltr']; 
    
    if (!allowedUnits.includes(trimmedUnit)) {
      throw new ExpressError(`Invalid unit type. Allowed values are: ${allowedUnits.join(', ')}`, 400);
    }    
    //cloudinary file upload handling
    let targetUrl = "";
    let targetFilename = "";

    if (req.file) {
      targetUrl = req.file.path;        
      targetFilename = req.file.filename;    
    } else if (imageUrl && imageUrl.trim() !== "") {
      targetUrl = imageUrl;
      const parts = imageUrl.split('/');
      targetFilename = parts.length > 0 ? parts[parts.length - 1] : "external-link";
    } else {
      targetUrl = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"; 
      targetFilename = "placeholder-default";
    }

    //sku duplication check
    const existingSku = await Product.findOne({ sku: sku.trim() });
    if (existingSku) {
      throw new ExpressError('Product with this SKU already exists in the system', 409);
    }

    //  Ledger Record
    const newProduct = new Product({
      name,
      sku: sku.trim(),
      category,
      costPrice: Number(costPrice),
      quantity: Number(quantity),
      description,
      supplier,
      unit: trimmedUnit,
      image: { url: targetUrl, filename: targetFilename }
    });

    await newProduct.save();

    if (newProduct.quantity > 0) {
      try {
        await inventoryLogChange({
          product: newProduct._id,
          quantityChange: newProduct.quantity,
          type: "Purchase", 
          createdBy: req.user?._id || "admin"
        });
      } catch (logError) {
        console.error("Inventory log error:", logError.message);
      }
    }
    return res.status(201).json({message: 'Product created successfully', product: newProduct})
}

// get : /api/product/all  Get all Products
export const getAllProducts = async (req , res) => {
        const filter = filterProducts(req);
        const { limit ,skip,page } =  getPaginatedProducts(req);
        const {sortBy , sortorder} =  getSortProducts(req );
       const [products, total, statsArray] = await Promise.all([
      
         Product.find(filter) .sort({ [sortBy]: sortorder }).skip(skip).limit(limit).populate('category'),

      Product.countDocuments(filter),

      Product.aggregate([
        { $match: filter }, 
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            inStock: { $sum: { $cond: [{ $gt: ["$quantity", 0] }, 1, 0] } },
            outOfStock: { $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] } },
            lowStock: { $sum: { $cond: [{ $and: [{ $gt: ["$quantity", 0] }, { $lte: ["$quantity", 10] }] }, 1, 0] } }
          }
        }
      ])
    ]);

    const stats = statsArray[0] || {
      totalItems: 0,
      inStock: 0,
      outOfStock: 0,
      lowStock: 0
    };
    
    delete stats._id;

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      message: 'Products retrieved successfully',
      products,
      total,
      stats, 
      totalPages,
      page
    });
      
        return res.status(200).json({message : 'Products retrieved successfully' , products , total,stats , totalPages,page })
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

            const oldQuantity = updateProduct.quantity;

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
                try {
                    await cloudinary.uploader.destroy(updateProduct.image.filename, {
                    resource_type: 'image'
                    });
                } catch (destroyeeError) {
                    console.error("destroyee image error:", destroyeeError.message);
                }
            }

    //upload the new image to cloudinary
   const isCloudinaryStorage = req.file.filename && (req.file.path.startsWith('http://') || req.file.path.startsWith('https://'));
      
      if (isCloudinaryStorage) {
        updateProduct.image = { url: req.file.path, filename: req.file.filename };
      } else {
        let result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'image'
        });
        updateProduct.image = { url: result.secure_url, filename: result.public_id };
      }
}

await updateProduct.save();



//socket notification 
 if (typeof checkStockAlert === 'function') {
      checkStockAlert(updateProduct);
    }


    const newQuantity = updateProduct.quantity;
        const quantityDiff = newQuantity - oldQuantity;

        //  LOG entry
        try {
            if (quantityDiff !== 0) {
        await inventoryLogChange({
            product: updateProduct._id,
            quantityChange: quantityDiff,
            type: "Adjustment",
            createdBy: req.user?._id|| "admin"
        });
    }
} catch(logError){
          console.error("inventory log error:", logError.message);
        }
    

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