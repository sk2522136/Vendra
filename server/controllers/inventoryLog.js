import InventoryLog from "../models/InventoryLog.js";
import Product from "../models/Product.js";
import ExpressError from "../utils/expressError.js";
import { io } from '../server.js';

export const inventoryLogChange = async (data,tenantId) => {

  const { product, quantityChange, type, createdBy, sale } = data;

  // validation
  if (!product) throw new ExpressError("Product is required", 400);

  if (!["Sale", "Return", "Adjustment", "Purchase", "Sale Cancellation"].includes(type)) {
    throw new ExpressError("Invalid type", 400);
  }

  if (quantityChange === undefined) {
    throw new ExpressError("Quantity change required", 400);
  }


  // entry in enventroy log
  const logEntry = await InventoryLog.create({
    tenantId: tenantId,
    product,
    quantityChange,
    type,
    sale,
    createdBy,
    date: new Date()
  });

  return { success: true };
};


 //   api/inventory/status?type=..
export const getInventoryStatus = async (req, res) => {
  const tenantId = req.tenantId;
  const products = await Product.find({tenantId}).select("name quantity");

  let inventory = [];
  let totalStock = 0;

  let summary = {
    outOfStock: 0,
    critical: 0,
    low: 0,
    ok: 0,
  };

  const batchAlerts = [];

  products.forEach((product) => {
    const qty = product.quantity || 0;
    let status;

    if (qty <= 0) {
      status = "Out of Stock";
      summary.outOfStock++;

      batchAlerts.push({
        type: "outOfStock",
        name: product.name,
        msg: `${product.name} - Out of Stock!`,
      });

    } else if (qty < 15) {
      status = "Critical";
      summary.critical++;

      batchAlerts.push({
        type: "critical",
        name: product.name,
        msg: `${product.name} - Critical! Only ${qty} left!`,
      });

    } else if (qty < 20) {
      status = "Low";
      summary.low++;

      batchAlerts.push({
        type: "lowStock",
        name: product.name,
        msg: `⚠️ ${product.name} - Low stock! ${qty} left`,
      });

    } else {
      status = "OK";
      summary.ok++;
    }

    inventory.push({
      productId: product._id,
      productName: product.name,
      currentStock: qty,
      status,
    });

    totalStock += qty;
  });

  if (batchAlerts.length > 0) {
    io.emit("inventoryAlertBatch", batchAlerts);
  }

  return res.status(200).json({
    success: true,
    inventory,
    summary,
  });
};


// api/inventory/history
export const getInventoryHistory = async (req, res)=>{
  const {productId} = req.params;
  const tenantId = req.tenantId;
  const product = await  Product.findById({ _id: productId, tenantId });
  if(!product){
  throw new ExpressError('Product Not found', 404);
  }
 const logs = await InventoryLog.find({tenantId, product: productId }).populate('createdBy', 'name').sort({date:1})
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



