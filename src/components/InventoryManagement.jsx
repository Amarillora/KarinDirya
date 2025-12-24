import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/InventoryManagement.css'

export default function InventoryManagement() {
  const [stockLevels, setStockLevels] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddStock, setShowAddStock] = useState(false)
  const [newStock, setNewStock] = useState({
    ingredient_id: '',
    container_type: '',
    quantity_containers: '',
    container_size: '',
    container_price: '',
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchStockLevels()
    fetchIngredients()
  }, [])

  const fetchStockLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('current_stock_levels')
        .select('*')
        .order('ingredient_name')

      if (error) throw error
      setStockLevels(data || [])
    } catch (error) {
      console.error('Error fetching stock levels:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('ingredient_name')

      if (error) throw error
      setIngredients(data || [])
    } catch (error) {
      console.error('Error fetching ingredients:', error)
    }
  }

  const addStock = async () => {
    if (!newStock.ingredient_id || !newStock.container_type || !newStock.quantity_containers || 
        !newStock.container_size || !newStock.container_price) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const { error } = await supabase
        .from('stock_ingredients')
        .insert({
          ingredient_id: parseInt(newStock.ingredient_id),
          container_type: newStock.container_type,
          quantity_containers: parseInt(newStock.quantity_containers),
          container_size: parseFloat(newStock.container_size),
          container_price: parseFloat(newStock.container_price),
          supplier: newStock.supplier,
          purchase_date: newStock.purchase_date
        })

      if (error) throw error

      alert('Stock added successfully!')
      setShowAddStock(false)
      setNewStock({
        ingredient_id: '',
        container_type: '',
        quantity_containers: '',
        container_size: '',
        container_price: '',
        supplier: '',
        purchase_date: new Date().toISOString().split('T')[0]
      })
      fetchStockLevels()
    } catch (error) {
      console.error('Error adding stock:', error)
      alert('Error adding stock')
    }
  }

  const getStockStatus = (totalStock) => {
    if (totalStock === 0) return 'out-of-stock'
    if (totalStock < 5) return 'low-stock'
    return 'in-stock'
  }

  if (loading) {
    return <div className="loading">Loading inventory...</div>
  }

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <h1>Inventory Management</h1>
        <button className="add-stock-btn" onClick={() => setShowAddStock(!showAddStock)}>
          {showAddStock ? 'Cancel' : '+ Add Stock'}
        </button>
      </div>

      {showAddStock && (
        <div className="add-stock-section">
          <h2>Add New Stock</h2>
          <div className="stock-form">
            <select
              value={newStock.ingredient_id}
              onChange={(e) => setNewStock({ ...newStock, ingredient_id: e.target.value })}
            >
              <option value="">Select Ingredient</option>
              {ingredients.map(ing => (
                <option key={ing.ingredient_id} value={ing.ingredient_id}>
                  {ing.ingredient_name} ({ing.unit_of_measurement})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Container Type (e.g., bottle, bag, kg)"
              value={newStock.container_type}
              onChange={(e) => setNewStock({ ...newStock, container_type: e.target.value })}
            />

            <input
              type="number"
              placeholder="Number of Containers"
              value={newStock.quantity_containers}
              onChange={(e) => setNewStock({ ...newStock, quantity_containers: e.target.value })}
            />

            <input
              type="number"
              step="0.01"
              placeholder="Container Size"
              value={newStock.container_size}
              onChange={(e) => setNewStock({ ...newStock, container_size: e.target.value })}
            />

            <input
              type="number"
              step="0.01"
              placeholder="Price per Container"
              value={newStock.container_price}
              onChange={(e) => setNewStock({ ...newStock, container_price: e.target.value })}
            />

            <input
              type="text"
              placeholder="Supplier (Optional)"
              value={newStock.supplier}
              onChange={(e) => setNewStock({ ...newStock, supplier: e.target.value })}
            />

            <input
              type="date"
              value={newStock.purchase_date}
              onChange={(e) => setNewStock({ ...newStock, purchase_date: e.target.value })}
            />

            <button className="submit-stock-btn" onClick={addStock}>
              Add Stock Entry
            </button>
          </div>

          {newStock.container_size && newStock.container_price && (
            <div className="calculation-preview">
              <p>Unit Price: ₱{(parseFloat(newStock.container_price) / parseFloat(newStock.container_size)).toFixed(4)} per unit</p>
              {newStock.quantity_containers && (
                <>
                  <p>Total Quantity: {parseFloat(newStock.quantity_containers) * parseFloat(newStock.container_size)} units</p>
                  <p>Total Cost: ₱{(parseFloat(newStock.quantity_containers) * parseFloat(newStock.container_price)).toFixed(2)}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="stock-summary">
        <h2>Current Stock Levels</h2>
        <div className="stock-cards">
          {stockLevels.length === 0 ? (
            <p className="no-stock">No stock data available</p>
          ) : (
            stockLevels.map(stock => (
              <div key={stock.ingredient_id} className={`stock-card ${getStockStatus(stock.total_stock)}`}>
                <div className="stock-header">
                  <h3>{stock.ingredient_name}</h3>
                  <span className={`stock-badge ${getStockStatus(stock.total_stock)}`}>
                    {getStockStatus(stock.total_stock) === 'out-of-stock' ? 'Out of Stock' : 
                     getStockStatus(stock.total_stock) === 'low-stock' ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
                <div className="stock-details">
                  <div className="stock-info">
                    <span className="stock-label">Total Stock:</span>
                    <span className="stock-value">
                      {parseFloat(stock.total_stock).toFixed(2)} {stock.unit_of_measurement}
                    </span>
                  </div>
                  <div className="stock-info">
                    <span className="stock-label">Avg Unit Price:</span>
                    <span className="stock-value">₱{parseFloat(stock.avg_unit_price).toFixed(4)}</span>
                  </div>
                  <div className="stock-info">
                    <span className="stock-label">Stock Entries:</span>
                    <span className="stock-value">{stock.stock_entries}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
