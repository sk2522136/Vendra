import { useState } from 'react';
import { FaArrowRight, FaLock, FaEnvelope, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const Login = () => {

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    const response = await login(formData);
    
    // ✅ Check کر - response میں success ہے یا نہیں
    if (response.success) {
      toast.success('Login successful! 🎉', {
        position: "top-right",
        autoClose: 2000,
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
    
  } catch (err) {
    const errorMessage = 
      err.response?.data?.message || 
      "Invalid Email or Password";
    
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 3000,
    });
    
    setError(errorMessage);

  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-white via-gray-100 to-black overflow-hidden relative flex items-center justify-center">

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        <div className="absolute -top-40 -right-40 w-96 h-96 bg-black opacity-20 rounded-full blur-3xl animate-pulse"></div>

        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white opacity-30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1.5s' }}></div>

        <div className="absolute top-1/2 left-1/2 
        -translate-x-1/2 -translate-y-1/2 
        w-80 h-80 bg-gray-400 opacity-10 
        rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '0.75s' }}></div>

      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full h-screen flex items-center justify-center px-3">

        <div className="w-full max-w-6xl h-[600px]">

          <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full rounded-3xl overflow-hidden border border-gray-300 shadow-2xl">

            {/* LEFT SIDE */}
            <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-black to-gray-900 p-10">

              {/* Logo */}
              <div>

                <h1 className="text-5xl font-black text-white mb-3">
                  VENDARA<span className="text-gray-500">.</span>
                </h1>

                <div className="w-20 h-1.5 bg-gradient-to-r from-white to-gray-500 rounded-full"></div>

              </div>

              {/* Content */}
              <div>

                <h2 className="text-3xl font-black text-white mb-4">
                  Control Your Inventory
                </h2>

                <p className="text-gray-400 text-sm mb-8">
                  Real-time stock tracking, sales management,
                  and business insights all in one powerful platform.
                </p>

                {/* Features */}
                <div className="space-y-3">

                  {[
                    'Real-time inventory tracking',
                    'Automated stock alerts',
                    'Sales analytics dashboard',
                  ].map((feature, i) => (

                    <div key={i} className="flex items-center gap-3">

                      <div className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center">

                        <FaCheck size={10} className="text-white" />

                      </div>

                      <span className="text-gray-300 text-sm">
                        {feature}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

              <div className="pt-6 border-t border-white border-opacity-10">

                <p className="text-xs text-gray-500 uppercase">
                  © 2026 VENDARA Systems
                </p>

              </div>

            </div>

            {/* RIGHT SIDE FORM */}
            <div className="flex flex-col bg-white px-8 py-8">

              {/* Header */}
              <div className="mb-6">

                <h2 className="text-3xl font-black text-black mb-1">
                  Welcome Back
                </h2>

                <p className="text-gray-500 text-sm">
                  Sign in to access your dashboard
                </p>

              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}
                className="space-y-4">

                {/* Email */}
                <div>

                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                    Email
                  </label>

                  <div className="relative">

                    <FaEnvelope className="absolute left-3 top-3 text-gray-400" size={12} />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-300 focus:border-black outline-none"
                    />

                  </div>

                </div>

                {/* Password */}
                <div>

                  <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
                    Password
                  </label>

                  <div className="relative">

                    <FaLock className="absolute left-3 top-3 text-gray-400" size={12} />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-gray-300 focus:border-black outline-none"
                    />

                  </div>

                  {/* Error Message */}
                  {error && (

                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {error}
                    </p>

                  )}

                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 bg-black text-white font-black py-2.5 rounded-lg hover:bg-gray-800 transition-all uppercase text-xs flex items-center justify-center gap-2 disabled:opacity-70"
                >

                  {isLoading ? (

                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Processing...
                    </>

                  ) : (

                    <>
                      Sign In
                      <FaArrowRight size={10} />
                    </>

                  )}

                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;