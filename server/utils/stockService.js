import Product from "../models/Product.js";
import { inventoryLogChange } from "../controllers/inventoryLog.js";
import { checkStockAlert } from "./checkStockAlert.js";

export const updateStock = async ({
  productId,
  change,
  type,
  sale = null,
  user = null
}) => {

  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  product.quantity += change;
  await product.save();

  checkStockAlert(product);

  await inventoryLogChange({
    product: productId,
    quantityChange: change,
    type,
    sale,
    createdBy: user
  });

  return product;
};