import { useState,useEffect } from 'react';
import { FaArrowRight, FaLock, FaEnvelope, FaCheck } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { replace, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';


const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Loading, setLoading] = useState(false);
  const { user, loading,login  } = useAuth();
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
      const response = await login({ email, password });

      if (response.success) {
        toast.success("Login successful! 🎉");
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        console.error("Login failed:", response.message);
        toast.error(response.message || "Invalid email or password");
        setPassword(""); // Clear password field
      }
    } catch (error) {
      console.error("Login error:", error.message);
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false); 
    }

  
  };

  return (
 <div className="w-screen h-screen bg-bg-body overflow-hidden relative flex items-center justify-center p-4 font-mona">
      
      {/* Background Subtle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-bg-secondary opacity-[0.08] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-bg-primary opacity-[0.05] rounded-full blur-3xl"></div>
      </div>

      {/* Main Card Container */}
      <div className="relative z-10 w-full max-w-5xl h-[600px] bg-bg-card rounded-[2rem] shadow-2xl overflow-hidden flex border border-border">

        {/* LEFT SIDE: Brand Branding */}
        <div className="hidden lg:flex flex-col justify-between bg-bg-secondary p-12 w-[40%]">
          <div>
            {/* Logo Section */}
            <div className="flex flex-col mb-8"> 
              
              <div className="flex items-center  mb-4"> 
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
                  <span className="text-3xl font-black text-bg-secondary">V</span>
                </div>
                <span className="text-4xl font-black text-white tracking-tighter">endra</span>
              </div>

              {/* Line ab neeche aa jayegi */}
              <div className="w-16 h-1.5 bg-bg-primary rounded-full"></div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Enterprise POS System</h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              Manage your operations with precision. Designed for efficiency and scale.
            </p>
          </div>

          <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">© 2026 Vendra Systems</p>
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="flex flex-col justify-center w-full lg:w-[60%] px-10 lg:px-20 py-12">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-text mb-2">Welcome Back</h2>
            <p className="text-muted text-sm">Sign in to access your secure dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-black text-muted mb-2 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-4 text-muted" size={14} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vendra.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border focus:border-bg-primary outline-none transition-all bg-hover text-sm font-bold text-text"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[10px] font-black text-muted mb-2 uppercase tracking-widest">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-4 text-muted" size={14} />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border focus:border-bg-primary outline-none transition-all bg-hover text-sm font-bold text-text"
                />
              </div>
              
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={Loading}
              className="w-full bg-bg-primary text-white font-black py-4 rounded-2xl hover:bg-bg-secondary transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100 active:scale-[0.98]"
            >
              {Loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>SIGN IN <FaArrowRight size={12} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

};

export default Login;