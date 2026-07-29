export const filterProducts = (req) => {
let filter = { isActive: true, tenantId: req.tenantId };  

  // CATEGORY FILTER
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // SEARCH FILTER
  if (req.query.search) {
    filter.name = {
      $regex: req.query.search,
      $options: "i",
    };
  }

  // STOCK FILTER 
  if (req.query.stock === "in") {
    filter.quantity = { $gt: 0 };
  }

  if (req.query.stock === "out") {
    filter.quantity = 0;
  }

  if (req.query.stock === "low") {
    filter.quantity = { $gt: 0, $lte: 10 };
  }

  return filter;
};


export const getPaginatedProducts = (req) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  return { limit, skip, page };
};

export const getSortProducts = (req) => {
  const sortBy = req.query.sortBy || "createdAt";

  const order = req.query.order?.toLowerCase() === "asc" ? 1 : -1;

  return { sortBy, sortorder: order };
};



export default {filterProducts , getPaginatedProducts , getSortProducts};