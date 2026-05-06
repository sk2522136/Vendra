import { useState,useEffect } from 'react';
import ActionModal from '../ActionModal';
import { createExpense } from '../../services/api'; 
import { toast } from 'react-toastify';


const AddExpenseModal = ({ isOpen, onClose ,onExpenseAdded}) => {
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    paymentMethod: 'Cash'
  });

    const [loading, setLoading] = useState(false);

    const categories = ['Salary', 'Rent', 'Utilities', 'Maintenance'];
    const paymentMethods = ['Cash', 'Bank Transfer', 'Check'];


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.amount || !formData.description || !formData.category) {
      toast.error("Please fill all required fields");
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      // API call
      const res = await createExpense({
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date,
        paymentMethod: formData.paymentMethod
      });

      toast.success("Expense added successfully!");
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash'
      });

      onClose();
      onExpenseAdded(); // Reload expenses in parent

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add expense";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  


  return (
    <ActionModal isOpen={isOpen} onClose={onClose} title="Add New Expense">
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        
        <input 
          type="number" 
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount (Rs)" 
          className="w-full p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:border-black font-bold text-sm text-text required" 
        />
        
        <input 
          type="text" 
          name='description'
          value={formData.description}
          onChange={handleChange}
          placeholder="Description" 
          className="w-full p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:border-black font-bold text-sm text-text required" 
        />
        
        <select 
          name='category'
          value={formData.category}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:border-black font-bold text-sm text-text"
        >
          <option >Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input 
          type="date" 
          name='date'
          value={formData.date}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:border-black font-bold text-sm text-text" 
        />

        <select 
          name='paymentMethod'
          value={formData.paymentMethod}
          onChange={handleChange}
          className="w-full p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-gray-50 border border-gray-200 outline-none focus:border-black font-bold text-sm text-text"
        >
          <option value="" disabled selected>Payment Method</option>
          {paymentMethods.map( method=> (
            <option key={method} value={method}>
              {method}
            </option>
        ))}
        </select>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white font-black py-3 sm:py-4 rounded-lg sm:rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all uppercase text-xs tracking-widest mt-3 sm:mt-2"
        >
          {loading ? "Saving..." : "Save Expense"}
        </button>
      </form>
    </ActionModal>
  );
};

export default AddExpenseModal;