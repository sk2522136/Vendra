import { useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiFilter, FiPackage, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import AddItemModal from "../components/Items/AddItemModal.jsx";


function Items() {

    const [isModelOpen , setIsModelOpen]=useState(false)
    const [selectedItem , setSelectedItem]=useState(null)  
    

    const dummyProducts = [
    { _id: "1", name: "Organic Flour", sku: "FLR-001", category: "Grocery", costPrice: 450, quantity: 50, unit: "kg", image: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=100&auto=format&fit=crop" }, isActive: true },
    { _id: "2", name: "Cooking Oil 5L", sku: "OIL-502", category: "Oil", costPrice: 1800, quantity: 8, unit: "ltr", image: { url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=100&auto=format&fit=crop" }, isActive: true },
    { _id: "3", name: "Basmati Rice", sku: "RCE-103", category: "Grocery", costPrice: 1100, quantity: 0, unit: "kg", image: { url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=100&auto=format&fit=crop" }, isActive: true }
  ];

  const handleAdd =()=>{
    setSelectedItem(null);
    setIsModelOpen(true)
  }

  const handleEdit = (product) => {
    setSelectedItem(product);
    setIsModelOpen(true);
  }



  return (
    <div className='p-6 min-h-screen space-y-8'>
        <div className='grid  md:grid-cols-3 grid-cols-1 gap-6'>
            <div className='border border-border rounded-xl shadow-sm p-5 flex items-center gap-2'>
                <div className=' w-12 h-12 bg-blue-50 items-center text-blue-600 rounded-xl flex justify-center '><FiPackage size={24}/></div>
                <div ><p className='text-sm text-muted font-medium'>Total items</p><h4 className='text-2xl font-bold text-text'>124</h4></div>
            </div>
             <div className='border border-border rounded-xl shadow-sm p-5 flex items-center gap-2'>
                <div className=' w-12 h-12 items-center bg-orange-50 text-orange-600 rounded-xl flex justify-center '><FiPackage size={24}/></div>
                <div ><p className='text-sm text-muted font-medium'>Low Stock</p><h4 className='text-2xl font-bold text-text'>12</h4></div>
            </div>
             <div className='border border-border rounded-xl shadow-sm p-5 flex items-center gap-2'>
                <div className=' w-12 h-12 bg-green-light text-green items-center  rounded-xl flex justify-center '><FiPackage size={24}/></div>
                <div ><p className='text-sm text-muted font-medium'>In Stock</p><h4 className='text-2xl font-bold text-text'>122</h4></div>
            </div>
         </div>
         <div className=' p-4 border border-border rounded-xl shadow-sm flex flex-col justify-between items-center lg:flex-row '>
            <div className='relative w-full lg:w-96 '>
                <FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-hint '/>
                <input type="text"
                placeholder='Search SKU ,Product Name...'
                className='w-full pr-4 pl-11 border border-border rounded-xl py-2.5 bg-gray-50 text-sm outline-none focus:border-green focus:bg-white transition-all   '
                 />
            </div>
            <div className='flex items-center w-full lg:w-auto gap-3'>
                <button className='flex-1 lg:flex-none flex items-center justify-center border gap-2 px-4 py-2.5 border-border text-text font-semibold rounded-xl hover:bg-gray-50 text-sm transition-all'>
                    <FiFilter/> Filters                    
                </button>
                <button onClick={handleAdd} className='flex-1 lg:flex-none flex items-center justify-center border gap-2 px-6 py-2.5 bg-green text-white font-semibold rounded-xl hover:bg-green-dark text-sm transition-all'>
                    <FiPlus/> add product
                </button>
            </div>
             </div>
             <div className='border border-border rounded-xl shadow-sm overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left'>
                        <thead>
                            <tr className='bg-gray-50  border-b border-border'>
                                <th className='py-4 px-6 text-[13px] font-bold text-muted uppercase tracking-wider'>PRODUCT INFO</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-muted uppercase tracking-wider text-center">SKU</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-muted uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-muted uppercase tracking-wider">Stock Status</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-muted uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-border'>
                            {dummyProducts.map((item)=>(
                                <tr key={item.id} className='hover:bg-green-light/10 transition-colors group'>
                                    <td className='px-6 py-4 '>
                                        <div className='flex items-center gap-4'>
                                            <div className='w-12 h-12 rounded-xl border border-border bg-gray-100 overflow-hidden group-hover:border-green transition-all'>
                                                <img src={item.image.url} alt="" className='w-full h-full object-cover' />
                                            </div>
                                            <div>
                                                <p>{item.name}</p>
                                                <p>{item.unit}</p>
                                            </div>
                                        </div>
                                     </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 bg-gray-100 text-muted text-[11px] font-bold rounded-md border border-border">{item.sku}</span>
                                            </td> 
                                            <td className="px-6 py-4 text-[14px] font-medium text-text">{item.category}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                    className={`h-full rounded-full ${item.quantity > 10 ? 'bg-green' : item.quantity > 0 ? 'bg-orange-500' : 'bg-red-500'}`} 
                                                    style={{ width: `${Math.min(item.quantity, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-[12px] font-bold ${item.quantity <= 10 ? 'text-red-500' : 'text-green'}`}>
                                                    {item.quantity === 0 ? 'Out of Stock' : `${item.quantity} In Stock`}
                                                </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-text">Rs {item.costPrice}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(item)} className="p-2 hover:bg-green-light hover:text-green text-muted rounded-lg transition-all"><FiEdit2 size={18}/></button>
                                                <button className="p-2 hover:bg-red-50 hover:text-red-600 text-muted rounded-lg transition-all"><FiTrash2 size={18}/></button>
                                                </div>
                                            </td>                              
                                      </tr>
                            
                            ))}

                        </tbody>
                   </table>



                </div>
             </div>
       
      <AddItemModal
        isOpen={isModelOpen} 
        onClose={() => setIsModelOpen(false)} 
        initialData={selectedItem}
      />
    </div>
  )
}

export default Items
