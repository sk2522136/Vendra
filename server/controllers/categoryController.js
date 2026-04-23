import Category from "../models/Category.js";
import Product from '../models/Product.js'
import ExpressError from "../utils/expressError.js";


 // Post : /api/categories
export const createCategory = async (req , res) => {
    const {name} =  req.body
    const existingCategory = await Category.findOne({name : name.trim()})
    if (existingCategory) {
        throw new ExpressError('Category already exist', 409);
    }
    const category = await Category.create({name : name.trim()})
    return res.status(201).json({success : true, message : "Category created successfully", category})
}

// get : /api/categories
export const getAllCategories = async (req , res) => {
        const categories = await Category.find({isActive : true}).sort({createdAt : -1})
        return res.status(200).json({success : true, categories})
    }
 
  // get :/api/products/categories:id
export const getProductByCategory = async (req , res) => {
        const {id} = req.params;
        const products = await Product.find({category:id , isActive:true});
        if (!products || products.length === 0) {
            throw new ExpressError('No product Found for this category', 404);
        }
        return res.status(200).json({success : true, products})
    }

 // Patch : /api/categories:id
export const updateCategory = async (req , res) => {
    const {id} = req.params;
    const {name} = req.body;
    const category = await Category.findByIdAndUpdate(id , {name : name.trim()} , {new : true}) 
    if(!category ) {
        throw new ExpressError('Category not found', 404);
        }
        return res.status(200).json({success : true, message : "Category updated successfully", category})
}

// delete: /api/categories:id
export const deleteCategory =  async (req , res ) => {
        const {id} = req.params;
       const productExist = await Product.findOne({ category: id });
        if (productExist) {
            throw new ExpressError('Cannot delete this category product are linked', 409);
        }
        const category = await Category.findByIdAndUpdate(id , {isActive : false} , {new : true})
        if(!category ) {
        throw new ExpressError('Category not found', 404);
        }
        return res.status(200).json({success : true, message : "Category deleted successfully", category})
   
}

