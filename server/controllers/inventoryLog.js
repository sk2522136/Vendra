import InventoryLog from "../models/InventoryLog.js";
import Product from "../models/Product.js";
import ExpressError from "../utils/expressError.js";
import { io } from '../server.js';

export const inventoryLogChange = async (data) => {

  const { product, quantityChange, type, createdBy, sale } = data;

  // validation
  if (!product) throw new ExpressError("Product is required", 400);

  if (!["Sale", "Return", "Adjustment", "Purchase", "Sale Cancellation"].includes(type)) {
    throw new ExpressError("Invalid type", 400);
  }

  if (quantityChange === undefined) {
    throw new ExpressError("Quantity change required", 400);
  }

  const logEntry = await InventoryLog.create({
    product,
    quantityChange,
    type,
    sale,
    createdBy,
    date: new Date()
  });

  return { success: true };
};


 //   api/inventory/status?type=....
export const getInventoryStatus = async(req ,res)=>{
   let {type} = req.query;
   const products = await Product.find().select('name quantity');    
   
   
let inventory = [];
    let totalStock = 0;
    let outOfStockCount = 0;
    let criticalCount = 0;
    let lowCount = 0;
    let okCount = 0;

    const batchAlerts = [];

    products.forEach(product => {
      let status;
      const qty = product.quantity || 0;

      if (qty <= 0) {
        status = "Out of Stock";
        outOfStockCount++;
        batchAlerts.push({ type: 'outOfStock', name: product.name, msg: `❌ ${product.name} - Out of Stock!` });
      } else if (qty < 20) {
        if (qty < 15) {
          status = "Critical";
          criticalCount++;
          batchAlerts.push({ type: 'critical', name: product.name, msg: `🔴 ${product.name} - Critical! Only ${qty} left!` });
        } else {
          status = "Low";
          lowCount++;
          batchAlerts.push({ type: 'lowStock', name: product.name, msg: `⚠️ ${product.name} - Low stock! ${qty} left` });
        }
      } else {
        status = "OK";
        okCount++;
      }
      
      inventory.push({
        productId: product._id,
        productName: product.name,
        currentStock: qty,  
        status: status
      });

      totalStock += qty;
    });

    let filteredProduct = inventory;
    if (type === 'low') {
      filteredProduct = inventory.filter(p => ["Low", "Critical", "Out of Stock"].includes(p.status));
    }

    const summary = {
      outOfStock: outOfStockCount,
      critical: criticalCount,
      low: lowCount,
      ok: okCount
    };

     //socket io
    if (batchAlerts.length > 0) {
      io.emit('inventoryAlertBatch', batchAlerts);
    }

    return res.status(200).json({
      success: true,
      type: type || 'current',
      inventory: filteredProduct,
      totalProducts: filteredProduct.length,
      totalStock: type === 'low' 
        ? filteredProduct.reduce((sum, p) => sum + p.currentStock, 0) 
        : totalStock,
      summary
    });
}



// invetory history product wise api/inventory/history
export const getInventoryHistory = async (req, res)=>{
  const {productId} = req.params;
  const product = await  Product.findById(productId);
  if(!product){
  throw new ExpressError('Product Not found', 404);
  }
 const logs = await InventoryLog.find({ product: productId }).populate('createdBy', 'name').sort({date:1})
    let currentStock = 0;
    const history = [];
 
    for (let log of logs){
     currentStock +=log.quantityChange
  
  history.push({
    date:log.date,
    type:log.type,
    change: log.quantityChange,  
        runningStock: currentStock,  
createdBy: log.createdBy ? log.createdBy.name : 'System / Unknown'
      }) }

      return res.status(200).json({
      success: true,
      productId: product._id,
      productName: product.name,
      currentStock: currentStock,  
      totalTransactions: history.length,
      history: history
    });

}



