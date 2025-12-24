import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/MenuList.css'

export default function MenuList() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('menu_name')

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Error fetching menu items:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (menuId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ is_available: !currentStatus })
        .eq('menu_id', menuId)

      if (error) throw error
      fetchMenuItems()
    } catch (error) {
      console.error('Error updating availability:', error)
    }
  }

  const filteredItems = filter === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category?.toLowerCase() === filter)

  if (loading) {
    return <div className="loading">Loading menu...</div>
  }

  return (
    <div className="menu-list">
      <div className="menu-header">
        <h1>Menu Items</h1>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'main course' ? 'active' : ''} 
            onClick={() => setFilter('main course')}
          >
            Main Course
          </button>
          <button 
            className={filter === 'appetizer' ? 'active' : ''} 
            onClick={() => setFilter('appetizer')}
          >
            Appetizer
          </button>
        </div>
      </div>

      <div className="menu-grid">
        {filteredItems.map((item) => (
          <div key={item.menu_id} className="menu-card">
            <div className="menu-image">
              <img 
                src={item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
                alt={item.menu_name}
                onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}
              />
              <span className={`availability-badge ${item.is_available ? 'available' : 'unavailable'}`}>
                {item.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <div className="menu-details">
              <h3>{item.menu_name}</h3>
              <p className="description">{item.description}</p>
              <div className="menu-footer">
                <span className="price">₱{parseFloat(item.selling_price).toFixed(2)}</span>
                <button 
                  className="toggle-btn"
                  onClick={() => toggleAvailability(item.menu_id, item.is_available)}
                >
                  {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
              </div>
              {item.preparation_time && (
                <span className="prep-time">⏱️ {item.preparation_time} mins</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
