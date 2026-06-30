import { useState, useEffect, use } from 'react';
import { FiX, FiUploadCloud, FiDollarSign } from "react-icons/fi";
import {getAllCategories , getAllSuppliers} from '../../services/api.js';
import { toast } from 'react-toastify';

const AddItemModal = ({ isOpen, onClose, initialData,onAddProduct,onUpdateProduct }) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', costPrice: '',supplier: '',
    quantity: '', unit: 'kg', description: '',
    image: null
  })

  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(()=>{
    fetchCategories();
    fetchSuppliers();
  },[])

   

  const fetchCategories = async () =>{
    try {
      const res = await getAllCategories();
      setCategories(res.data.categories); 
    } catch (error) {
      toast.error('Failed to fetch categories', { position: "top-right" });
    }
  }

  const fetchSuppliers = async () =>{
    try {
      const res = await getAllSuppliers();
      setSuppliers(res.data.suppliers); 
    } catch (error) {
      toast.error('Failed to fetch suppliers', { position: "top-right" });
    }
  }

useEffect(() => {
    if (initialData && isOpen) {
      setFormData(initialData);
      setPreview(initialData.image?.url || null);
    } else {
      setFormData({
        name: '', sku: '', category: 'Grocery', costPrice: '',supplier: '',
        quantity: '', unit: 'kg', description: '',
        image: null
      })
      setPreview(null);
    }
  }, [initialData, isOpen])

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFormData(prev => ({
      ...prev,
      image: file
    }));
    }
  };


  const handleSubmit = (e) =>{
    e.preventDefault();
    if(isEditMode){
      onUpdateProduct(formData);
    } else {
      onAddProduct(formData);
    }
  }

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl'>
        
        {/* Header - Fixed text color and styles */}
        <div className='flex justify-between items-center px-8 py-6 border-b border-border  bg-bg-body sticky top-0 z-10'>
          <div>
            <h3 className='text-xl font-bold text-bg-secondary'>
              {isEditMode ? "Edit Product Details" : "Create New Product"}
            </h3>
            <p className='text-sm text-bg-primary'>Enter detail to add a new item to inventory</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 text-black hover:text-red-500 rounded-full transition-all"><FiX size={20} /></button>
        </div>

        <form className='p-8 space-y-6' 
        onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <div>
                <label className='block text-xs font-bold text-black uppercase mb-1.5 ml-1'>Product Name</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} type="text" placeholder="e.g. Organic Sugar" className='w-full px-4 py-3 bg-white rounded-2xl text-black border focus:bg-white border-border outline-none focus:border-bg-primary/50 text-sm transition-all shadow-sm' />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-bold text-black uppercase mb-1.5 ml-1'>SKU Code</label>
                  <input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} type="text" placeholder="e.g. SUG-001" className='w-full px-4 py-3 bg-white rounded-2xl text-black border focus:bg-white border-border outline-none focus:border-bg-primary/50 text-sm transition-all shadow-sm' />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1.5 ml-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className='w-full px-4 py-3 bg-white rounded-2xl text-black border focus:bg-white appearance-none border-border outline-none focus:border-bg-primary/50 transition-all text-sm shadow-sm'>
                    <option value="">Select Category</option>
                     {categories.map((cat) => (
                       <option key={cat._id} value={cat._id}  >
                         {cat.name}    
                         </option>
                        ))}


                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1.5 ml-1">Cost Price</label>
                  <div className="relative">
                    <input value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} type="number" placeholder="0.00" className="w-full pl-9 pr-4 py-3 bg-white rounded-2xl text-black border focus:bg-white border-border outline-none focus:border-bg-primary/50 transition-all text-sm shadow-sm" />
                  </div>
                 </div>
                
                <div>
                  <label className="block text-xs font-bold text-black uppercase mb-1.5 ml-1">Initial Stock</label>
                  <input value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} type="number" placeholder="100" className="w-full px-4 py-3 bg-white rounded-2xl text-black border focus:bg-white border-border outline-none focus:border-bg-primary/50 transition-all text-sm shadow-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                <label className=" text-xs font-bold text-black uppercase mb-1.5 ml-1">Unit</label>
                <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className='w-full px-4 py-3 bg-white rounded-2xl text-black border focus:bg-white border-border outline-none focus:border-bg-primary/50 transition-all text-sm shadow-sm'>
                  <option>kg</option>
                  <option>g</option>
                  <option>L</option>
                </select>

              </div>
              <div>
              <label className="block text-xs font-bold text-black uppercase mb-1.5 ml-1">
                Suppliers
              </label>
              <select
              value={formData.supplier} onChange={(e) =>setFormData({ ...formData, supplier: e.target.value })}
              className='w-full px-4 py-3 bg-gray-50 rounded-2xl text-black border focus:bg-white border-border outline-none focus:border-bg-primary/50 transition-all text-sm shadow-sm'>
              <option value ="" >Select suppliers</option>
               {suppliers.map((sup) => (
                       <option key={sup._id} value={sup._id}  >
                         {sup.name}    
                         </option>
                        ))}
            </select>
    </div>
</div>
            </div>

            <div className="space-y-5">
              <label className="block text-[11px] font-bold text-black uppercase mb-2 ml-1">Product Media</label>
              <div className="relative group border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-bg-primary/50 transition-all cursor-pointer min-h-40">
                {preview ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-xl shadow-md border border-border mb-2" />
                    <button type="button" onClick={() => setPreview(null)} className="text-[10px] font-bold text-red-500 underline">Remove Image</button>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className="text-bg-secondary mb-2" size={32} />
                    <p className="text-sm font-bold text-bg-secondary">Drag or Click to Upload</p>
                    <p className="text-[10px] text-bg-primary">Supports: JPG, PNG, WEBP</p>
                  </>
                )}
                <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div>
                {/* Description added back */}
                <label className="block text-xs font-bold text-black uppercase mb-1.5 ml-1">Description (Optional)</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" placeholder="Add some notes about the product..." className="w-full px-4 py-3 bg-white rounded-2xl text-black border border-border outline-none focus:border-bg-primary/50 focus:bg-white transition-all text-sm resize-none"></textarea>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-border text-sm font-bold text-text hover:bg-gray-50 transition-all">
              Discard
            </button>
            <button type="submit" className="px-10 py-2.5 rounded-xl bg-bg-primary text-white text-sm font-bold hover:bg-bg-secondary shadow-lg shadow-black/20 transition-all">
              {isEditMode ? "Save Changes" : "Confirm & Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;