
import { io } from "../server.js";

export const checkStockAlert = (product) => {

  

  if (product.quantity === 0) {
    io.emit("outOfStock", {
      productId: product._id,
      productName: product.name,
      message: ` ${product.name} - Out of Stock!`
    });

  }

  else if (product.quantity <= 10 && product.quantity > 0) {

    io.emit("lowStock", {
      productId: product._id,
      productName: product.name,
      quantity: product.quantity,
      message: `${product.name} - Only ${product.quantity} left!`
    });

  }

};