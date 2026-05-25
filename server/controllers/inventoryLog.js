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


 // check status of stock  api/inventory/status?type=....
export const getInventoryStatus = async(req ,res)=>{
   let {type} = req.query;
    
    const products = await Product.find();
    let inventory=[];
    let status;
    let totalStock = 0;
    for (let product of products){
    
     if (product.quantity <= 0) {
        status = "Out of Stock";
      } else if (product.quantity < 20) {
        status = product.quantity < 15 ? "Critical" : "Low";
      } else {
        status = "OK";
      }
      
      inventory.push({
      productId: product._id,
      productName: product.name,
      currentStock: product.quantity,  
      status: status
    })
     totalStock += product.quantity;

  }

  let filterproduct;

if(type === 'low'){
  filterproduct = inventory.filter(p =>
    p.status === "Low" ||
    p.status === "Critical" ||
    p.status === "Out of Stock"
  );
}
else {
  //  DEFAULT
  filterproduct = inventory;
}

  const summary = {
      outOfStock: inventory.filter(p => p.status === "Out of Stock").length,
      critical: inventory.filter(p => p.status === "Critical").length,
      low: inventory.filter(p => p.status === "Low").length,
      ok: inventory.filter(p => p.status === "OK").length
    };

          //EMIT STOCK ALERTS
      inventory.forEach(item => {
        if (item.status === "Out of Stock") {
          io.emit('outOfStock', {
            productId: item.productId,
            productName: item.productName,
            message: `❌ ${item.productName} - Out of Stock!`
          });
        } else if (item.status === "Critical") {
          io.emit('lowStock', {
            productId: item.productId,
            productName: item.productName,
            quantity: item.currentStock,
            message: `🔴 ${item.productName} - Critical! Only ${item.currentStock} left!`
          });
        } else if (item.status === "Low") {
          io.emit('lowStock', {
            productId: item.productId,
            productName: item.productName,
            quantity: item.currentStock,
            message: `⚠️ ${item.productName} - Low stock! ${item.currentStock} left`
          });
        }
      });


      return res.status(200).json({
      success: true,
      type: type || 'current',
      inventory: filterproduct,
      totalProducts: filterproduct.length,
      totalStock: type === 'low' 
        ? filterproduct.reduce((sum, p) => sum + p.quantity, 0)
        : totalStock,
      summary: summary
    });
}



// invetory history product wise api/inventory/history
export const getInventoryHistory = async (req, res)=>{
  const {productId} = req.params;
  const product = await  Product.findById(productId);
  if(!product){
  throw new ExpressError('Product Not found', 404);
  }
 const logs = await InventoryLog.find({ product: productId }).sort({date:1})
    let currentStock = 0;
    const history = [];
 
    for (let log of logs){
     currentStock +=log.quantityChange
  
  history.push({
    date:log.date,
    type:log.type,
    change: log.quantityChange,  
        runningStock: currentStock,  
        createdBy: log.createdBy
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



