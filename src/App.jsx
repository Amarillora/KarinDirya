import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import MenuList from './components/MenuList'
import OrderManagement from './components/OrderManagement'
import InventoryManagement from './components/InventoryManagement'
import './styles/App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/menu" element={<MenuList />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/inventory" element={<InventoryManagement />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  )
}

export default App
