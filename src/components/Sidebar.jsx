import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import '../styles/Sidebar.css'

export default function Sidebar() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(true)

  const navItems = [
    { path: '/', icon: '📊', label: 'DASHBOARD' },
    { path: '/menu', icon: '🍽️', label: 'MENU' },
    { path: '/orders', icon: '📋', label: 'ORDERS' },
    { path: '/inventory', icon: '📦', label: 'INVENTORY' }
  ]

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '☰'}
      </button>
      
      <motion.aside 
        className={`sidebar ${isOpen ? 'open' : 'closed'}`}
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="sidebar-header">
          <motion.div 
            className="logo"
            whileHover={{ rotate: 15 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <span className="logo-icon">🍳</span>
            <h2>Karindirya</h2>
          </motion.div>
          <p className="tagline">Filipino Eatery</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <motion.div
                className="nav-content"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </motion.div>
              {location.pathname === item.path && (
                <motion.div
                  className="active-indicator"
                  layoutId="activeNav"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">👨‍🍳</div>
            <div className="user-details">
              <p className="user-name">Restaurant Owner</p>
              <p className="user-role">Admin</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
