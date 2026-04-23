import Customer from "../models/Customer.js";

export const getAllCustomers = async (req , res) =>{

    const {id} = req.params;
    const customers = await Customer.findById(id);
    res.status(200).json({success: true, customers});

}