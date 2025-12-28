import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/MenuList.css'

export default function MenuList() {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [ingredients, setIngredients] = useState([])

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

  const fetchIngredients = async (menuId) => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(`
          *,
          ingredients (
            ingredient_id,
            ingredient_name,
            unit_of_measurement
          )
        `)
        .eq('menu_id', menuId)

      if (error) throw error
      setIngredients(data || [])
    } catch (error) {
      console.error('Error fetching ingredients:', error)
      setIngredients([])
    }
  }

  const handleCardClick = async (item) => {
    setSelectedMenu(item)
    await fetchIngredients(item.menu_id)
  }

  const closeModal = () => {
    setSelectedMenu(null)
    setIngredients([])
  }

  const formatQuantity = (quantity, unit) => {
    const qty = parseFloat(quantity)
    if (unit === 'kg' && qty < 1) {
      return `${(qty * 1000).toFixed(0)} g`
    }
    if (unit === 'L' && qty < 1) {
      return `${(qty * 1000).toFixed(0)} mL`
    }
    return `${qty} ${unit}`
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
          <div key={item.menu_id} className="menu-card" onClick={() => handleCardClick(item)}>
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
                  className={`toggle-btn ${item.is_available ? 'available-btn' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleAvailability(item.menu_id, item.is_available)
                  }}
                >
                  {item.is_available ? 'Available' : 'Mark Available'}
                </button>
              </div>
              {item.preparation_time && (
                <span className="prep-time">⏱️ {item.preparation_time} mins</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ingredients Modal */}
      {selectedMenu && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedMenu.menu_name}</h2>
                <p className="modal-subtitle">
                  {selectedMenu.category} • ₱{parseFloat(selectedMenu.selling_price).toFixed(2)}
                </p>
              </div>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="summary-cards">
                <div className="summary-card">
                  <span className="summary-label">Preparation Time</span>
                  <span className="summary-value">{selectedMenu.preparation_time || 'N/A'} mins</span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Status</span>
                  <span className="summary-value">{selectedMenu.is_available ? '✓ Available' : '✕ Unavailable'}</span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Ingredients</span>
                  <span className="summary-value">{ingredients.length} items</span>
                </div>
              </div>

              <div className="ingredients-section">
                <div className="ingredients-header">
                  <h3>📋 Required Ingredients</h3>
                  <span className="ingredient-count">{ingredients.length} ingredients</span>
                </div>

                {ingredients.length === 0 ? (
                  <p className="no-ingredients">No ingredients listed for this menu item</p>
                ) : (
                  <div className="ingredients-list">
                    {ingredients.map((ing, index) => (
                      <div key={index} className="ingredient-item">
                        <div className="ingredient-icon">🥘</div>
                        <div className="ingredient-details">
                          <h4>{ing.ingredients?.ingredient_name || 'Unknown Ingredient'}</h4>
                          <span className="ingredient-quantity">
                            {formatQuantity(ing.quantity_needed, ing.ingredients?.unit_of_measurement || '')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedMenu.description && (
                <div className="description-section">
                  <h3>📖 Description</h3>
                  <p>{selectedMenu.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
