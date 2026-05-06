import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, logout as logoutApi, isAuth } from "../services/api.js";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await isAuth();
      
      if (data.success) {
        setUser(data.user); 
      }
    } catch (error) {
            setUser(null); 

      toast.error("Authentication check failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }finally {
      setLoading(false); 
    }};

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await loginApi(credentials);
      
  
      const authResponse = await isAuth();
      
      if (authResponse.data.success) {
        setUser(authResponse.data.user);
      }
      
      return data;
    } catch (error) {
       toast.error("Authentication check failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null); 
    } catch (error) {
       toast.error("Authentication check failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);