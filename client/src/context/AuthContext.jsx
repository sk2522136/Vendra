import { createContext, useContext, useState, useEffect, useRef } from "react";
import { login as loginApi, logout as logoutApi, isAuth } from "../services/api.js";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
   const authCheckInProgress = useRef(false);
  
  const checkAuth = async () => {
   if (authCheckInProgress.current) {
      return;
    }

        authCheckInProgress.current = true; 


    try {
      const { data } = await isAuth();
      setUser(data?.success ? data.user : null);
    } catch {
      setUser(null);
    } finally {
      authCheckInProgress.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);
  const login = async (credentials) => {
  setLoading(true);
  try {
    const { data } = await loginApi(credentials);
    setUser(data.user);
    return { success: true, data };
  } catch (error) {
    const message = error.response?.data?.message || "Invalid email or password";
    return { success: false, message: message }; 
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    try {
      setLoading(true);
      await logoutApi();
      setUser(null);
      setLoading(false);
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);