import {useNavigate} from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Login = ()=>{
    const [email ,setEmail] = useState('')
    const [password ,setPassword] = useState('')
    const navigate = useNavigate()
    const {login} = useAuth()

    const handleSubmit = async (e)=>{
        e.preventDefault();
        try {
            await login({email ,password})
            navigate('/dashboard');
        } catch (error) {
            alert("Login failed: " + (err.response?.data?.message || "Something went wrong"));
        }

    }

    return (
        <div className='long-container'>
            <form onSubmit={handleSubmit}>
                <h2>inventos Login</h2>
                <input 
                type="email"
                placeholder='Email'
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
                 />

                 <input 
                 type="password" 
                 placeholder='Password'
                 value={password}
                 onChange={(e)=>setPassword(e.target.value)}
                 />
                 <button type="submit">Login</button>

            </form>
        </div>
    )
}

export default Login;