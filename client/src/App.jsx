import {BrowserRouter ,Routes , Route ,Navigate} from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Items from './pages/Items.jsx'
import Pos from './pages/Pos.jsx'
import Customer from './pages/Customer.jsx'
import ViewModel from './components/customer/ViewModel.jsx'
import ReturnModal from './components/customer/ReturnModel.jsx'
import UpdateModel from './components/customer/UpdateModel.jsx'
import Supplier from './pages/Supplier.jsx'
import ExpenseTracker from './pages/ExpenseTracker.jsx'
import Inventory from './pages/Inventory.jsx'
import Category from './pages/Category.jsx'
import Staff from './pages/Staff.jsx'
import Report from './pages/Report.jsx'

function App() {
  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<Layout/>}>
    <Route index element={<Navigate to="/dashboard" />} />
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='items' element={<Items/>}/>
        <Route path='pos' element={<Pos/>}/>
        <Route path='customer' element={<Customer/>}/>
        <Route path='/suppliers' element={<Supplier/>}/>
        <Route path='/expenses' element={<ExpenseTracker/>}/>
        <Route path='/inventory' element={<Inventory/>}/>
        <Route path='/category' element={<Category/>}/>
        <Route path='/staff' element={<Staff/>}/>
        <Route path='/reports' element={<Report/>}/>
        

     
    </Route>

    
    {/* <Route path='/login' element={<Login/>}>
    <Route path='/' element={
      <ProtectedRoute>
        <Layout/>
      </ProtectedRoute>
    }> 
</Route>
    </Route> */}
   
    </Routes>
   </BrowserRouter>
  )
}

export default App

