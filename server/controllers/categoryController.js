import Category from "../models/Category.js";
import Product from '../models/Product.js'
import ExpressError from "../utils/expressError.js";


 // Post : /api/categories
export const createCategory = async (req , res) => {
    const {name} =  req.body
    const tenantId = req.tenantId;
    const existingCategory = await Category.findOne({name : name.trim(),tenantId})
    if (existingCategory) {
        throw new ExpressError('Category already exist', 409);
    }
    const category = await Category.create({name : name.trim(),tenantId})
    return res.status(201).json({success : true, message : "Category created successfully", category})
}

// get : /api/categories
export const getAllCategories = async (req , res) => {
        const tenantId = req.tenantId;
        const categories = await Category.find({tenantId,isActive : true}).sort({createdAt : -1})
        return res.status(200).json({success : true, categories})
    }
 
  // get :/api/products/categories:id
export const getProductByCategory = async (req , res) => {
        const {id} = req.params;
        const tenantId = req.tenantId;
        const products = await Product.find({category:id ,tenantId, isActive:true});
        if (!products || products.length === 0) {
            throw new ExpressError('No product Found for this category', 404);
        }
        return res.status(200).json({success : true, products})
    }

 // Patch : /api/categories:id
export const updateCategory = async (req , res) => {
    const {id} = req.params;
    const {name} = req.body;
    const tenantId = req.tenantId;
    const category = await Category.findByIdAndUpdate(id ,tenantId, {name : name.trim()} , {new : true}) 
    if(!category ) {
        throw new ExpressError('Category not found', 404);
        }
        return res.status(200).json({success : true, message : "Category updated successfully", category})
}

// delete: /api/categories:id
export const deleteCategory =  async (req , res ) => {
        const {id} = req.params;
        const tenantId = req.tenantId;
       const productExist = await Product.findOne({ category: id,tenantId });
        if (productExist) {
            throw new ExpressError('Cannot delete this category product are linked', 409);
        }
        const category = await Category.findByIdAndUpdate(id , tenantId,{isActive : false} , {new : true})
        if(!category ) {
        throw new ExpressError('Category not found', 404);
        }
        return res.status(200).json({success : true, message : "Category deleted successfully", category})
   
}

