import { useState } from 'react';
import { FaArrowRight, FaLock, FaEnvelope, FaUser, FaBuilding, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signup } from '../services/api';

const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    if (!formData.companyName.trim()) {
      toast.error('Please enter your company name');
      return false;
    }
    if (!formData.password) {
      toast.error('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!formData.agreeTerms) {
      toast.error('Please accept the terms & conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await signup({
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName,
        password: formData.password
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Account created successfully!');
        setTimeout(() => navigate('/login'), 500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-bg-body overflow-hidden relative flex items-center justify-center p-4 font-mona">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-bg-secondary opacity-[0.08] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-bg-primary opacity-[0.05] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl h-[600px] bg-bg-card rounded-[2rem] shadow-2xl overflow-hidden flex border border-border">
        <div className="hidden lg:flex flex-col justify-between bg-bg-secondary p-10 w-[40%]">
          <div>
            <div className="flex flex-col mb-6"> 
              <div className="flex items-center mb-3"> 
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
                  <span className="text-3xl font-black text-bg-secondary">V</span>
                </div>
                <span className="text-4xl font-black text-white tracking-tighter">endra</span>
              </div>
              <div className="w-16 h-1.5 bg-bg-primary rounded-full"></div>
            </div>
          </div>

          <div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Join Vendra</h2>
            <p className="text-blue-200 text-xs leading-relaxed">
              Start selling online, manage inventory seamlessly, and scale your business with automated insights.
            </p>
          </div>

          <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">© 2026 Vendra Systems</p>
        </div>

        <div className="flex flex-col justify-center w-full lg:w-[60%] px-8 lg:px-12 py-6 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-2xl font-black text-text mb-1">Create Account</h2>
            <p className="text-muted text-xs">Set up your business profile to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-muted mb-1 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-3.5 text-muted" size={13} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Your name"
                    className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-border focus:border-bg-primary outline-none transition-all bg-hover text-xs font-bold text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted mb-1 uppercase tracking-widest">Company Name</label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-3.5 text-muted" size={13} />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter your store name"
                    className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-border focus:border-bg-primary outline-none transition-all bg-hover text-xs font-bold text-text"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-muted mb-1 uppercase tracking-widest">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-3.5 text-muted" size={13} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                  className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-border focus:border-bg-primary outline-none transition-all bg-hover text-xs font-bold text-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-muted mb-1 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-3.5 text-muted" size={13} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-9 py-2.5 rounded-xl border border-border focus:border-bg-primary outline-none transition-all bg-hover text-xs font-bold text-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted hover:text-text transition-colors"
                  >
                      {showPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-muted mb-1 uppercase tracking-widest">Confirm Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-3.5 text-muted" size={13} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-9 py-2.5 rounded-xl border border-border focus:border-bg-primary outline-none transition-all bg-hover text-xs font-bold text-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted hover:text-text transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-3.5 h-3.5 rounded border-border bg-hover text-bg-primary focus:ring-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-muted font-medium cursor-pointer">
                I agree to the <a href="#" className="text-bg-primary underline">Terms</a> & <a href="#" className="text-bg-primary underline">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bg-primary text-white font-black py-3 rounded-xl hover:bg-bg-secondary transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100 active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>SIGN UP <FaArrowRight size={12} /></>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center text-xs text-muted">
              <p className="flex items-center gap-1">
                Already have an account?{' '}
                <Link to="/login" className="text-bg-primary hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default SignUp;