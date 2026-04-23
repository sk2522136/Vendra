import { useState ,useEffect} from 'react';
import { FiX, FiUploadCloud, FiDollarSign } from "react-icons/fi";

const AddItemModal = ({ isOpen, onClose ,initialData }) => {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: '', sku: '', category: 'Grocery', costPrice: '', 
    quantity: '', unit: 'kg', description: '',
    image: { url: '', filename: '' }
  })

   const [preview , setPreview] = useState( null);
   
   useEffect(()=>{
     if(initialData && isOpen){
      setFormData(initialData);
      setPreview(initialData.image?.url || null);
     }else{
           setFormData({
            name: '', sku: '', category: 'Grocery', costPrice: '', 
            quantity: '', unit: 'kg', description: '',
            image: { url: '', filename: '' }
           })
           setPreview(null);
          }
   },[initialData,isOpen])

   const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };
   
  if (!isOpen) return null;

  return (
   <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
    <div className='bg-white rounded-3xl w-full max-w-3xl  overflow-hidden shadow-2xl animate-in zoom-in fade-in duration-200'>
      <div className='flex justify-between items-center px-8 py-6 border border-border bg-gray-50/50'>
        <div>
          <h3 className='text-xl font-bold text-text'>
            {isEditMode ? "Edit Product Details" : "Create New Product"}
          </h3>
          <p className='text-sm text-muted'>Enter detail to add a new item to inventory</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"><FiX size={20}/></button>
      </div>
      <form className='p-8 space-y-6' >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div>
              <label className='block text-xs font-bold text-muted uppercase mb-1.5 ml-1 '>Product Name</label>
              <input value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g. Organic Sugar" className='w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-green text-sm transition-all ' />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                   <label className='block text-xs font-bold text-muted uppercase mb-1.5 ml-1 '>SKU Code</label>
                   <input value={formData.sku} onChange={(e)=>setFormData({...formData, sku: e.target.value})} type="text" placeholder="e.g. SUG-001" className='w-full px-4 py-3  rounded-xl border border-border outline-none focus:border-green text-sm transition-all ' /> 
              </div>
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 ml-1">Category</label>
                <select value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})} className='w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-green transition-all text-sm bg-white '>
                  <option >Grocery</option>
                  <option >Oil</option>
                  <option >Bakery</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase mb-1.5 ml-1">Cost Price</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input value={formData.costPrice} onChange={(e)=>setFormData({...formData, costPrice: e.target.value})} type="number" placeholder="0.00" className="w-full pl-9 pr-4 py-3 rounded-xl border border-border outline-none focus:border-green transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase mb-1.5 ml-1">Initial Stock</label>
                  <input value={formData.quantity} onChange={(e)=>setFormData({...formData, quantity: e.target.value})} type="number" placeholder="100" className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-green transition-all text-sm" />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 ml-1">Unit</label>
                <select value={formData.unit} onChange={(e)=>setFormData({...formData, unit: e.target.value})} className='w-full px-4 py-3 border border-border rounded-xl outline-none focus:border-green transition-all text-sm bg-white '>
                  <option >kg</option>
                  <option >g</option>
                  <option >L</option>
                </select>
              </div>
            </div>
            </div>  
            
            <div className="space-y-5">
              <label className="block text-[11px] font-bold text-muted uppercase mb-2 ml-1">Product Media</label>
              <div className="relative group border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:border-green hover:bg-green-light/5 transition-all cursor-pointer min-h-40">
                {preview ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded-xl shadow-md border border-border mb-2" />
                    <button onClick={() => setPreview(null)} className="text-[10px] font-bold text-red-500 underline">Remove Image</button>
                  </div>
                ) : (
                  <>
                    <FiUploadCloud className="text-muted group-hover:text-green mb-2 transition-colors" size={32} />
                    <p className="text-sm font-bold text-text">Drag or Click to Upload</p>
                    <p className="text-[10px] text-muted">Supports: JPG, PNG, WEBP</p>
                  </>
                )}
                <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
                  <div>
                <label className="block text-xs font-bold text-muted uppercase mb-1.5 ml-1">Description (Optional)</label>
                <textarea value={formData.description} onChange={(e)=>setFormData({...formData, description: e.target.value})} rows="3" placeholder="Add some notes about the product..." className="w-full px-4 py-3 rounded-xl border border-border outline-none focus:border-green transition-all text-sm resize-none"></textarea>
              </div>
               </div>
               
          </div>
          
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-border text-sm font-bold text-text hover:bg-gray-50 transition-all">
              Discard
            </button>
            <button type="submit" className="px-10 py-2.5 rounded-xl bg-green text-white text-sm font-bold hover:bg-green-dark shadow-lg shadow-green/20 transition-all">
              {isEditMode ? "Save Changes" : "Confirm & Add Item"}
            </button>
          </div>
      </form>

    </div>
   </div>
  );
};

export default AddItemModal;