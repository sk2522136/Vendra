import { createContext ,useState ,useEffect ,useContext} from "react";
import API, {login as loginApi , logout as logoutApi , isAuth} from '../services/api.js'

const AuthContext = createContext();

export  const AuthProvider =  ({children})=>{
  const [user ,setUser]= useState(null);
  const [loading ,setLoading]= useState(true);
  
  const checkAuth = async ()=>{
    try {
        const {data} = await isAuth()
        if(data.success){
            setUser(data)
        }
    } catch (error) {
         setUser(null)
    } finally {
      setLoading(false)
    }
  }
  
const login = async()=>{
   const {data} = await loginApi (data)
   setUser(data.user)
   return data;
}

const logout = async()=>{
  await logoutApi()
  setUser(null) 
}

useEffect(()=>{
  checkAuth();
},[])

return (
  <AuthContext.Provider value={{ user, login, logout, loading }}>
    {!loading && children}
    </AuthContext.Provider>
);
}
export const useAuth = () => useContext(AuthContext);
