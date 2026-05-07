import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, logout as logoutApi, isAuth } from "../services/api.js";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const checkAuth = async () => {
    try {
      
      const { data } = await isAuth();
      
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  checkAuth();
}, []);


  const login = async (credentials) => {
    try {
      const { data } = await loginApi(credentials);
      
      if (data.success) {
        const authResponse = await isAuth();
        
        if (authResponse.data.success) {
          setUser(authResponse.data.user);
        }
      }
      
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null); 
    } catch (error) {
       console.error("Logout failed.", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);