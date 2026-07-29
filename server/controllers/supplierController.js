import Supplier from '../models/supplier.js';
import Product from '../models/Product.js';
import ExpressError from "../utils/expressError.js";

export const createSupplier = async (req, res) => {
    const { name, contact } = req.body;
    const tenantId = req.tenantId;

    const existingSupplier = await Supplier.findOne({ name, contact,tenantId });
    if (existingSupplier) {
        throw new ExpressError('Supplier with this name and contact already exists', 400);
    }

    const supplier = await Supplier.create({ name, contact ,tenantId});
    return res.status(201).json({ success: true, message: 'Supplier created successfully', supplier });
};

export const getAllSuppliers = async (req, res) => {
    const tenantId = req.tenantId;
    const suppliers = await Supplier.find({ isActive: true,tenantId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, message: 'Suppliers retrieved successfully', suppliers });
};

export const getSupplierById = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const supplier = await Supplier.findById({ _id: id, tenantId });
    if (!supplier || !supplier.isActive) {
        throw new ExpressError('Supplier not found', 404);
    }
    return res.status(200).json({ success: true, message: 'Supplier retrieved successfully', supplier });
};

export const updateSupplier = async (req, res) => {
    const { id } = req.params;
    const { name, contact } = req.body;
    const tenantId = req.tenantId;

    const updateData = {};
    if (name) updateData.name = name;
    if (contact) updateData.contact = contact;

    if (name && contact) {
        const existingSupplier = await Supplier.findOne({
            tenantId ,
            name: name.trim(),
            contact: contact.trim(),
            _id: { $ne: id }
        });
        if (existingSupplier) {
            throw new ExpressError('Supplier with this name and contact already exists', 400);
        }
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate({
         _id: id, tenantId },
         updateData, 
         { 
            new: true 
        });
    if (!updatedSupplier) {
        throw new ExpressError('Supplier not found', 404);
    }

    return res.status(200).json({ success: true, message: 'Supplier updated successfully', updatedSupplier });
};

export const addPurchase = async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const tenantId = req.tenantId;

    if (!amount || amount <= 0) {
        throw new ExpressError('Valid purchase amount is required', 400);
    }

    const supplier = await Supplier.findById({_id: id, tenantId});
    if (!supplier || !supplier.isActive) {
        throw new ExpressError('Supplier not found', 404);
    }

    supplier.totalPurchase += amount;
    supplier.unpaidAmount += amount;   
    await supplier.save();

    return res.status(200).json({ success: true, message: 'Purchase recorded', supplier });
};

export const addPayment = async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    const tenantId = req.tenantId;


    if (!amount || amount <= 0) {
        throw new ExpressError('Valid payment amount is required', 400);
    }

    const supplier = await Supplier.findById({_id: id, tenantId});
    if (!supplier || !supplier.isActive) {
        throw new ExpressError('Supplier not found', 404);
    }

    if (amount > supplier.unpaidAmount) {
        throw new ExpressError('Payment exceeds unpaid amount', 400);
    }

    supplier.paidAmount += amount;
    supplier.unpaidAmount -= amount;   
    await supplier.save();

    return res.status(200).json({ success: true, message: 'Payment recorded', supplier });
};

export const deleteSupplier = async (req, res) => {
    const { id } = req.params;
    const tenantId = req.tenantId;
    const supplier = await Supplier.findById({_id:id,tenantId});
    if (!supplier || !supplier.isActive) {
        throw new ExpressError('Supplier not found', 404);
    }
    if (supplier.unpaidAmount > 0) {
        throw new ExpressError('Cannot delete supplier with unpaid amount', 400);
    }
    const productExist = await Product.findOne({ supplier: id, tenantId });
    if (productExist) {
        throw new ExpressError('Cannot delete supplier — products are linked', 400);
    }

    supplier.isActive = false;
    await supplier.save();
    return res.status(200).json({ success: true, message: 'Supplier deleted successfully', supplier });
};