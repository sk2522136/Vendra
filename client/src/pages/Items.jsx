import { useEffect, useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiFilter, FiPackage } from "react-icons/fi";
import AddItemModal from "../components/Items/AddItemModal.jsx";
import { fetchProduct, createProduct, updateProduct, deleteProduct } from '../services/api.js';
import { toast } from "react-toastify";

function Items() {


 

const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

 const [products , setProducts] = useState([]);
 const [loading, setLoading] = useState(false);
 const [stats, setStats] = useState({
  totalItems: 0,
  inStock: 0,
  outOfStock: 0,
  lowStock: 0
});

const [search, setSearch] = useState("");
const [category, setCategory] = useState("");
const [stock, setStock] = useState("");
const [page, setPage] = useState(1);
const [limit] = useState(10);
const [sortBy, setSortBy] = useState("createdAt");
const [order, setOrder] = useState("desc");
const [totalPages, setTotalPages] = useState(1);

//  card data for stats
const statsData = [
  {
    title: "Total Items",
    val: stats.totalItems,
    color: "text-[#252525]"
  },
  {
    title: "In Stock",
    val: stats.inStock,
    color: "text-[#3B82F6]"
  },
  {
    title: "Out of Stock",
    val: stats.outOfStock,
    color: "text-[#EF4444]"
  }
];

// get all products
 const loadProducts = async () => {
   try {
    setLoading(true);
      const res = await fetchProduct({ search, category, stock, page, limit, sortBy, order });
    setProducts(res.data.products);
    setStats(res.data.stats)
    setTotalPages(res.data.totalPages); 
setPage(res.data.page);

  } catch (error) {
 const errorMessage = 
      error.response?.data?.message || "Failed to fetch products";
     toast.error(errorMessage, {
      position: "top-right",
      autoClose: 3000,
    });
   } finally {
    setLoading(false);
   }
 }


  useEffect(()=>{
    loadProducts();
  },[search, category, stock, page, sortBy, order])

  // add product
  const handleAddProduct = async (data) => {
  try {
    setLoading(true);

    const sendData = new FormData();

    sendData.append("name", data.name);
    sendData.append("sku", data.sku);
    sendData.append("category", data.category);
    sendData.append("costPrice", data.costPrice);
    sendData.append("supplier", data.supplier);
    sendData.append("quantity", data.quantity);
    sendData.append("unit", data.unit);
    sendData.append("description", data.description);

   if (data.image instanceof File) {
  sendData.append("image", data.image);
}

    const res = await createProduct(sendData);

    toast.success("Product created successfully!");

    setIsModalOpen(false);
    await loadProducts();
  } catch (error) {

    console.log(error.response?.data);

    toast.error(
      error.response?.data?.message ||
      "Failed to create product"
    );

  } finally {
    setLoading(false);
  }
};

  // edit product
  const handleEditProduct = async (formData) => {
  if (!selectedItem) return;

  try {
    setLoading(true);

    const sendData = new FormData();

    sendData.append("name", formData.name);
    sendData.append("sku", formData.sku);
    sendData.append("category", formData.category);
    sendData.append("costPrice", formData.costPrice);
    sendData.append("supplier", formData.supplier);
    sendData.append("quantity", formData.quantity);
    sendData.append("unit", formData.unit);
    sendData.append("description", formData.description);

    if (formData.image instanceof File) {
      sendData.append("image", formData.image);
    }

    await updateProduct(selectedItem._id, sendData);

    toast.success("Product updated successfully!");
    setIsModalOpen(false);
    await loadProducts();
  } catch (error) {
    console.log(error.response?.data);

    toast.error(
      error.response?.data?.message || "Failed to update product"
    );
  } finally {
    setLoading(false);
  }
};
  // delete product
    const handleDeleteProduct = async (id) => {
      if (window.confirm("Are you sure you want to delete this product?")){
        try {
             setLoading(true);
            const res = await deleteProduct(id); 
            toast.success("Product Delete successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    await loadProducts();
        } catch (error) {
          const errorMessage = 
          error.response?.data?.message || "Failed to delete product";
         toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,          
          
        })
        }finally{
      setLoading(false);
    }
    }
   
  }

  const openAddModal = () => {
      setSelectedItem(null);
      setIsModalOpen(true);
    };
  
     const openEditModal = (item) => {
      setSelectedItem(item);
      setIsModalOpen(true);
    };


  return (
    <div className='p-6 overflow-y-auto space-y-8 bg-bg-body rounded-3xl'>
  
  <div className="mb-2">
    <h1 className='text-3xl font-black text-text uppercase tracking-tight'>Items Catalog</h1>
    <p className='text-muted text-sm font-medium mt-1'>Manage your product inventory, track stock levels, and update pricing details.</p>
  </div>

  <div className='grid md:grid-cols-3 grid-cols-1 gap-6'>
    {statsData.map((stat, i) => (
      <div key={i} className='border border-border rounded-3xl shadow-sm p-5 flex items-center gap-4 bg-bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'>
        <div className={`w-12 h-12 bg-bg-body ${stat.color} rounded-2xl flex justify-center items-center`}><FiPackage size={24} /></div>
        <div><p className='text-xs text-muted font-extrabold uppercase'>{stat.title}</p><h4 className='text-2xl font-black text-text'>{stat.val}</h4></div>
      </div>
    ))}
  </div>

  <div className='p-4 border border-border bg-bg-card rounded-3xl shadow-sm flex flex-col justify-between items-center lg:flex-row gap-4'>
    <div className='relative w-full lg:w-96'>
      <FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-muted' />
      <input value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }} type="text" placeholder='Search SKU, Product Name...' className='w-full pr-4 pl-11 border border-border bg-bg-body rounded-2xl py-3 text-text text-sm outline-none focus:border-bg-primary transition-all' />
    </div>
    <div className='flex items-center w-full lg:w-auto gap-3'>
      <select
          value={stock}
          onChange={(e) => {
            setStock(e.target.value);
            setPage(1);
          }}
          className='flex-1 lg:flex-none flex items-center justify-center border gap-2 px-6 py-3 border-border text-text font-bold rounded-2xl hover:bg-hover text-sm transition-all bg-bg-card'
        >
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
          <option value="low">Low Stock</option>
        </select>
      <button onClick={() => openAddModal()} className='flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-bg-primary text-white font-bold rounded-2xl hover:bg-bg-secondary text-sm transition-all'>
        <FiPlus /> Add Product
      </button>
    </div>
  </div>

  <div className='border border-border rounded-3xl shadow-sm overflow-hidden bg-bg-card'>
    <div className='overflow-x-auto'>
      <table className='w-full text-left'>
        <thead>
          <tr className='bg-bg-body text-text font-extrabold border-b border-border'>
            <th className='py-4 px-6 text-[11px] font-black text-muted uppercase tracking-wider'>PRODUCT INFO</th>
            <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-wider text-center">SKU</th>
            <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-wider">Stock Status</th>
            <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-wider">Price</th>
            <th className="px-6 py-4 text-[11px] font-black text-muted uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {products.map((item) => (
            <tr key={item._id} className='hover:bg-hover transition-colors group'>
              <td className='px-6 py-4 text-text font-bold'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 rounded-xl border border-border bg-bg-body overflow-hidden'>
                    <img src={item.image?.url} alt="" className='w-full h-full object-cover' />
                  </div>
                  <div>
                    <p className="text-sm text-text">{item.name}</p>
                    <p className="text-[11px] text-muted">{item.unit}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center text-text font-bold">
                <span className="px-3 py-1 bg-bg-body text-text text-[11px] font-bold rounded-xl border border-border">{item.sku}</span>
              </td>
              <td className="px-6 py-4 text-[13px] font-bold text-text">{item.category}</td>
              <td className="px-6 py-4 text-text font-bold">
                <div className="flex flex-col gap-1.5">
                  <div className="w-24 h-1.5 bg-bg-body rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.quantity > 10 ? 'bg-bg-primary' : item.quantity > 0 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${Math.min(item.quantity, 100)}%` }}></div>
                  </div>
                  <span className={`text-[10px] font-bold ${item.quantity <= 10 ? 'text-red-500' : 'text-muted'}`}>
                    {item.quantity === 0 ? 'Out of Stock' : `${item.quantity} In Stock`}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-text font-bold">Rs {item.costPrice}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => openEditModal(item)} className="p-2 bg-bg-body text-text hover:bg-bg-primary hover:text-white rounded-lg transition-all"><FiEdit2 size={16} /></button>
                  <button onClick={() => handleDeleteProduct(item._id)} className="p-2 bg-bg-body text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"><FiTrash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>

  {/* Pagination */}
  <div className="flex items-center justify-center gap-2 mt-6">
    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="w-10 h-10 flex items-center justify-center border border-border bg-bg-primary text-white rounded-xl hover:bg-bg-secondary disabled:opacity-40 transition-all">‹</button>
    {[...Array(totalPages)].map((_, index) => {
      const pageNumber = index + 1;
      return (
        <button key={pageNumber} onClick={() => setPage(pageNumber)} className={`w-10 h-10 flex items-center justify-center rounded-xl border text-sm font-bold transition-all ${page === pageNumber ? "bg-bg-primary text-white border-bg-primary" : "border-border text-text hover:bg-hover"}`}>
          {pageNumber}
        </button>
      );
    })}
    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="w-10 h-10 flex items-center justify-center border border-border bg-bg-primary text-white rounded-xl hover:bg-bg-secondary disabled:opacity-40 transition-all">›</button>
  </div>

  <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedItem} onAddProduct={handleAddProduct} onUpdateProduct={handleEditProduct} />
</div>
  );
}

export default Items;