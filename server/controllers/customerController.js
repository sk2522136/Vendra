import Customer from "../models/Customer.js";
import { filterProducts , getPaginatedProducts , getSortProducts } from '../utils/helperQuery.js';


export const getAllCustomers = async (req, res) => {
  const filter = filterProducts(req);
        const { limit ,skip,page } =  getPaginatedProducts(req);
        const {sortBy , sortorder} =  getSortProducts(req );
        const customers = await Customer.find(filter).sort({[sortBy]: sortorder}).skip(skip).limit(limit);
        const totalCustomers = await Customer.countDocuments(filter);
        const totalPages = Math.ceil(totalCustomers / limit); 



   
      
        return res.status(200).json({message : 'Customers retrieved successfully' , customers ,  totalPages,page,totalCustomers })
};