import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/InventoryManagement.css'

export default function InventoryManagement() {
  const [stockLevels, setStockLevels] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddStock, setShowAddStock] = useState(false)
  const [selectedStock, setSelectedStock] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [stockEntries, setStockEntries] = useState([])
  const [transactions, setTransactions] = useState([])
  const [viewMode, setViewMode] = useState('stock') // 'stock' or 'transactions'
  const [transactionLimit, setTransactionLimit] = useState(10)
  const [newStock, setNewStock] = useState({
    ingredient_id: '',
    container_type: '',
    quantity_containers: '',
    container_size: '',
    container_price: '',
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0]
  })
  const [massUnit, setMassUnit] = useState('kg')

  useEffect(() => {
    fetchStockLevels()
    fetchIngredients()
    fetchCategories()
    fetchTransactions()
  }, [])

  // Refresh stock levels when switching back to stock view
  useEffect(() => {
    if (viewMode === 'stock') {
      fetchStockLevels()
    } else if (viewMode === 'transactions') {
      fetchTransactions()
    }
  }, [viewMode])

  // Auto-refresh when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStockLevels()
        fetchTransactions()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          ingredients (
            ingredient_name,
            unit_of_measurement
          )
        `)
        .order('created_at', { ascending: false })
        .limit(transactionLimit)

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('category_name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchStockLevels = async () => {
    try {
      // First, get stock levels from the view
      const { data: stockData, error: stockError } = await supabase
        .from('current_stock_levels')
        .select('*')
        .order('ingredient_name')

      if (stockError) {
        console.error('Stock error:', stockError)
        throw stockError
      }

      // Then get ingredients with categories
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('ingredients')
        .select(`
          ingredient_id,
          category_id,
          categories (
            category_name
          )
        `)

      if (ingredientsError) {
        console.error('Ingredients error:', ingredientsError)
        throw ingredientsError
      }

      // Merge the data
      const mergedData = stockData.map(stock => {
        const ingredient = ingredientsData.find(ing => ing.ingredient_id === stock.ingredient_id)
        return {
          ...stock,
          ingredients: ingredient
        }
      })

      console.log('Merged stock data:', mergedData)
      setStockLevels(mergedData)
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
        .select(`
          *,
          categories (
            category_name
          )
        `)
        .order('ingredient_name')

      if (error) throw error
      setIngredients(data || [])
    } catch (error) {
      console.error('Error fetching ingredients:', error)
    }
  }

  const getSelectedIngredient = () => {
    return ingredients.find(ing => ing.ingredient_id === parseInt(newStock.ingredient_id))
  }

  const getSelectedCategory = () => {
    const ingredient = getSelectedIngredient()
    return ingredient?.categories?.category_name || ''
  }

  const needsContainerType = () => {
    const category = getSelectedCategory()
    // Meats, Vegetables, and Seafood don't need container type
    return !['Meats', 'Vegetables', 'Seafood'].includes(category)
  }

  const addStock = async () => {
    const selectedIngredient = getSelectedIngredient()
    const requiresContainer = needsContainerType()

    // Validation
    if (!newStock.ingredient_id || !newStock.quantity_containers || !newStock.container_price) {
      alert('Please fill in all required fields')
      return
    }

    if (requiresContainer && (!newStock.container_type || !newStock.container_size)) {
      alert('Please specify container type and size')
      return
    }

    try {
      let containerType, containerSize, containerPrice, quantityContainers

      if (requiresContainer) {
        // For items with containers (condiments, sauces, liquids)
        containerType = newStock.container_type
        containerSize = parseFloat(newStock.container_size)
        containerPrice = parseFloat(newStock.container_price)
        quantityContainers = parseInt(newStock.quantity_containers)
      } else {
        // For meats and vegetables (per kg)
        containerType = 'kg'
        
        // Convert grams to kg if needed
        if (massUnit === 'g') {
          const kgAmount = parseFloat(newStock.quantity_containers) / 1000 // Convert grams to kg
          quantityContainers = 1 // 1 container
          containerSize = kgAmount // Size in kg
          containerPrice = parseFloat(newStock.container_price) * kgAmount // Total cost (price per kg * kg amount)
        } else {
          quantityContainers = parseFloat(newStock.quantity_containers) // Number of kg
          containerSize = 1 // 1 kg per container
          containerPrice = parseFloat(newStock.container_price) // Price per kg
        }
      }
      
      console.log('Inserting stock:', {
        ingredient_id: parseInt(newStock.ingredient_id),
        container_type: containerType,
        quantity_containers: quantityContainers,
        container_size: containerSize,
        container_price: containerPrice,
        supplier: newStock.supplier,
        purchase_date: newStock.purchase_date
      })

      const { data, error } = await supabase
        .from('stock_ingredients')
        .insert({
          ingredient_id: parseInt(newStock.ingredient_id),
          container_type: containerType,
          quantity_containers: quantityContainers,
          container_size: containerSize,
          container_price: containerPrice,
          supplier: newStock.supplier,
          purchase_date: newStock.purchase_date
        })
        .select()

      if (error) {
        console.error('Insert error:', error)
        throw error
      }

      console.log('Stock added:', data)
      alert('Stock added successfully!')
      setShowAddStock(false)
      setMassUnit('kg')
      setNewStock({
        ingredient_id: '',
        container_type: '',
        quantity_containers: '',
        container_size: '',
        container_price: '',
        supplier: '',
        purchase_date: new Date().toISOString().split('T')[0]
      })
      
      // Refresh stock levels
      await fetchStockLevels()
    } catch (error) {
      console.error('Error adding stock:', error)
      alert(`Error adding stock: ${error.message}`)
    }
  }

  const getStockStatus = (totalStock) => {
    if (totalStock === 0) return 'out-of-stock'
    if (totalStock < 5) return 'low-stock'
    return 'in-stock'
  }

  const fetchStockEntries = async (ingredientId) => {
    try {
      const { data, error } = await supabase
        .from('stock_ingredients')
        .select('*')
        .eq('ingredient_id', ingredientId)
        .order('purchase_date', { ascending: false })

      if (error) throw error
      setStockEntries(data || [])
    } catch (error) {
      console.error('Error fetching stock entries:', error)
    }
  }

  const handleStockClick = async (stock) => {
    setSelectedStock(stock)
    setEditMode(false)
    await fetchStockEntries(stock.ingredient_id)
  }

  const closeModal = () => {
    setSelectedStock(null)
    setEditMode(false)
    setStockEntries([])
  }

  const deleteStockEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this stock entry?')) return

    try {
      const { error } = await supabase
        .from('stock_ingredients')
        .delete()
        .eq('stock_id', entryId)

      if (error) throw error

      alert('Stock entry deleted successfully!')
      await fetchStockEntries(selectedStock.ingredient_id)
      await fetchStockLevels()
    } catch (error) {
      console.error('Error deleting stock entry:', error)
      alert(`Error deleting entry: ${error.message}`)
    }
  }

  const updateStockEntry = async (entry) => {
    try {
      const { error } = await supabase
        .from('stock_ingredients')
        .update({
          container_type: entry.container_type,
          quantity_containers: entry.quantity_containers,
          container_size: entry.container_size,
          container_price: entry.container_price,
          supplier: entry.supplier,
          purchase_date: entry.purchase_date
        })
        .eq('stock_id', entry.stock_id)

      if (error) throw error

      alert('Stock entry updated successfully!')
      setEditMode(false)
      await fetchStockEntries(selectedStock.ingredient_id)
      await fetchStockLevels()
    } catch (error) {
      console.error('Error updating stock entry:', error)
      alert(`Error updating entry: ${error.message}`)
    }
  }

  const groupStockByCategory = () => {
    const grouped = {}
    stockLevels.forEach(stock => {
      const categoryName = stock.ingredients?.categories?.category_name || 'Uncategorized'
      if (!grouped[categoryName]) {
        grouped[categoryName] = []
      }
      grouped[categoryName].push(stock)
    })
    return grouped
  }

  const usesMassTerminology = (categoryName) => {
    return ['Meats', 'Vegetables', 'Staples', 'Seafood'].includes(categoryName)
  }

  const formatStockDisplay = (stock, unit) => {
    const stockValue = parseFloat(stock)
    if (unit === 'kg' && stockValue < 1) {
      // Convert to grams and display
      const grams = stockValue * 1000
      // Remove trailing zeros using regex
      return `${grams.toFixed(3).replace(/\.?0+$/, '')} g`
    }
    // Remove trailing zeros while keeping precision using regex
    // This preserves decimals like 9.9, 9.85, etc.
    return `${stockValue.toFixed(3).replace(/\.?0+$/, '')} ${unit}`
  }

  if (loading) {
    return <div className="loading">Loading inventory...</div>
  }

  const groupedStock = groupStockByCategory()
  const categoryOrder = ['Meats', 'Vegetables', 'Condiments', 'Spices', 'Liquids', 'Staples', 'Seafood', 'Dairy']
  const orderedCategories = categoryOrder.filter(cat => groupedStock[cat])

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <div>
          <h1>Inventory Management</h1>
          <p className="header-subtitle">Track and manage your restaurant ingredients</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={viewMode === 'stock' ? 'active' : ''}
              onClick={() => setViewMode('stock')}
            >
              📦 Stock Levels
            </button>
            <button 
              className={viewMode === 'transactions' ? 'active' : ''}
              onClick={() => setViewMode('transactions')}
            >
              📊 Transaction History
            </button>
          </div>
          <button className="add-stock-btn" onClick={() => setShowAddStock(!showAddStock)}>
            <span className="btn-icon">{showAddStock ? '✕' : '+'}</span>
            {showAddStock ? 'Cancel' : 'Add Stock'}
          </button>
        </div>
      </div>

      {viewMode === 'transactions' ? (
        <div className="transactions-section">
          <h2>Stock Transaction History</h2>
          <div className="transactions-table">
            <div className="transaction-header">
              <span>Date & Time</span>
              <span>Ingredient</span>
              <span>Type</span>
              <span>Change</span>
              <span>Before</span>
              <span>After</span>
              <span>Reference</span>
            </div>
            {transactions.length === 0 ? (
              <p className="no-transactions">No transactions recorded yet</p>
            ) : (
              <>
                {transactions.map(trans => (
                  <div key={trans.transaction_id} className={`transaction-row ${trans.transaction_type}`}>
                    <span className="trans-date">
                      {new Date(trans.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="trans-ingredient">{trans.ingredients?.ingredient_name}</span>
                    <span className={`trans-type ${trans.transaction_type}`}>
                      {trans.transaction_type === 'deduction' ? '📉 Deduction' : 
                       trans.transaction_type === 'purchase' ? '📈 Purchase' : 
                       '⚙️ Adjustment'}
                    </span>
                    <span className={`trans-change ${parseFloat(trans.quantity_change) < 0 ? 'negative' : 'positive'}`}>
                      {parseFloat(trans.quantity_change) > 0 ? '+' : ''}{parseFloat(parseFloat(trans.quantity_change).toFixed(3))} {trans.unit_of_measurement}
                    </span>
                    <span className="trans-before">{parseFloat(parseFloat(trans.quantity_before).toFixed(3))} {trans.unit_of_measurement}</span>
                    <span className="trans-after">{parseFloat(parseFloat(trans.quantity_after).toFixed(3))} {trans.unit_of_measurement}</span>
                    <span className="trans-ref">
                      {trans.order_number ? `Order: ${trans.order_number}` : trans.reference_type || '-'}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
          {transactions.length >= transactionLimit && (
            <div className="see-more-container">
              <button 
                className="see-more-btn" 
                onClick={() => setTransactionLimit(prev => prev + 10)}
              >
                See More
              </button>
            </div>
          )}
        </div>
      ) : (
        <>

      {showAddStock && (
        <div className="add-stock-section">
          <h2>📦 Add New Stock</h2>
          <div className="stock-form">
            <div className="form-group full-width">
              <label>Ingredient</label>
              <select
                value={newStock.ingredient_id}
                onChange={(e) => setNewStock({ ...newStock, ingredient_id: e.target.value })}
              >
                <option value="">Select Ingredient</option>
                {ingredients.map(ing => (
                  <option key={ing.ingredient_id} value={ing.ingredient_id}>
                    {ing.ingredient_name} ({ing.unit_of_measurement}) - {ing.categories?.category_name}
                  </option>
                ))}
              </select>
            </div>

            {newStock.ingredient_id && (
              <>
                {needsContainerType() ? (
                  <>
                    <div className="form-group">
                      <label>Container Type</label>
                      <input
                        type="text"
                        placeholder="e.g., bottle, bag, box"
                        value={newStock.container_type}
                        onChange={(e) => setNewStock({ ...newStock, container_type: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Number of Containers</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="e.g., 5"
                        value={newStock.quantity_containers}
                        onChange={(e) => setNewStock({ ...newStock, quantity_containers: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Size per Container ({getSelectedIngredient()?.unit_of_measurement})</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 1.5"
                        value={newStock.container_size}
                        onChange={(e) => setNewStock({ ...newStock, container_size: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Price per Container (₱)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 150"
                        value={newStock.container_price}
                        onChange={(e) => setNewStock({ ...newStock, container_price: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group full-width">
                      <label>Unit of Measurement</label>
                      <select
                        value={massUnit}
                        onChange={(e) => setMassUnit(e.target.value)}
                      >
                        <option value="kg">Kilograms (kg)</option>
                        <option value="g">Grams (g)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quantity ({massUnit})</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder={massUnit === 'kg' ? 'e.g., 10' : 'e.g., 500'}
                        value={newStock.quantity_containers}
                        onChange={(e) => setNewStock({ ...newStock, quantity_containers: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label>Price per Kilo (₱)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="e.g., 250"
                        value={newStock.container_price}
                        onChange={(e) => setNewStock({ ...newStock, container_price: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>Supplier (Optional)</label>
                  <input
                    type="text"
                    placeholder="Supplier name"
                    value={newStock.supplier}
                    onChange={(e) => setNewStock({ ...newStock, supplier: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    value={newStock.purchase_date}
                    onChange={(e) => setNewStock({ ...newStock, purchase_date: e.target.value })}
                  />
                </div>
              </>
            )}

            <button className="submit-stock-btn full-width" onClick={addStock}>
              ✓ Add Stock Entry
            </button>
          </div>

          {newStock.container_price && newStock.quantity_containers && (
            <div className="calculation-preview">
              <div className="calc-title">💰 Cost Breakdown</div>
              <div className="calc-grid">
                {needsContainerType() ? (
                  <>
                    {newStock.container_size && (
                      <>
                        <div className="calc-item">
                          <span className="calc-label">Unit Price:</span>
                          <span className="calc-value">₱{(parseFloat(newStock.container_price) / parseFloat(newStock.container_size)).toFixed(2)} per {getSelectedIngredient()?.unit_of_measurement}</span>
                        </div>
                        <div className="calc-item">
                          <span className="calc-label">Total Quantity:</span>
                          <span className="calc-value">{(parseFloat(newStock.quantity_containers) * parseFloat(newStock.container_size)).toFixed(2)} {getSelectedIngredient()?.unit_of_measurement}</span>
                        </div>
                        <div className="calc-item highlight">
                          <span className="calc-label">Total Cost:</span>
                          <span className="calc-value">₱{(parseFloat(newStock.quantity_containers) * parseFloat(newStock.container_price)).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="calc-item">
                      <span className="calc-label">Quantity:</span>
                      <span className="calc-value">{parseFloat(newStock.quantity_containers).toFixed(2)} {massUnit}</span>
                    </div>
                    <div className="calc-item">
                      <span className="calc-label">Price per Kg:</span>
                      <span className="calc-value">₱{parseFloat(newStock.container_price).toFixed(2)}</span>
                    </div>
                    {massUnit === 'g' && (
                      <div className="calc-item">
                        <span className="calc-label">Equivalent in Kg:</span>
                        <span className="calc-value">{(parseFloat(newStock.quantity_containers) / 1000).toFixed(2)} kg</span>
                      </div>
                    )}
                    <div className="calc-item highlight">
                      <span className="calc-label">Total Amount:</span>
                      <span className="calc-value">₱{massUnit === 'g' ? ((parseFloat(newStock.quantity_containers) / 1000) * parseFloat(newStock.container_price)).toFixed(2) : (parseFloat(newStock.quantity_containers) * parseFloat(newStock.container_price)).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="stock-summary">
        <h2>📊 Current Stock Levels</h2>
        
        {orderedCategories.length === 0 ? (
          <p className="no-stock">No stock data available</p>
        ) : (
          orderedCategories.map(categoryName => (
            <div key={categoryName} className="category-section">
              <div className="category-header">
                <h3>{categoryName}</h3>
                <span className="item-count">{groupedStock[categoryName].length} items</span>
              </div>
              
              <div className="stock-cards">
                {groupedStock[categoryName].map(stock => (
                  <div 
                    key={stock.ingredient_id} 
                    className={`stock-card ${getStockStatus(stock.total_stock)}`}
                    onClick={() => handleStockClick(stock)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="stock-header">
                      <h4>{stock.ingredient_name}</h4>
                      <span className={`stock-badge ${getStockStatus(stock.total_stock)}`}>
                        {getStockStatus(stock.total_stock) === 'out-of-stock' ? '⚠ Out' : 
                         getStockStatus(stock.total_stock) === 'low-stock' ? '⚡ Low' : '✓ OK'}
                      </span>
                    </div>
                    <div className="stock-details">
                      <div className="stock-info">
                        <span className="stock-label">Stock</span>
                        <span className="stock-value">
                          {formatStockDisplay(stock.total_stock, stock.unit_of_measurement)}
                        </span>
                      </div>
                      <div className="stock-info">
                        <span className="stock-label">Avg Price</span>
                        <span className="stock-value">₱{parseFloat(stock.avg_unit_price).toFixed(2)}</span>
                      </div>
                      <div className="stock-info">
                        <span className="stock-label">Entries</span>
                        <span className="stock-value">{stock.stock_entries}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stock Details Modal */}
      {selectedStock && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedStock.ingredient_name}</h2>
                <p className="modal-subtitle">
                  {selectedStock.ingredients?.categories?.category_name} • {selectedStock.unit_of_measurement}
                </p>
              </div>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="summary-cards">
                <div className="summary-card">
                  <span className="summary-label">Total Stock</span>
                  <span className="summary-value">{formatStockDisplay(selectedStock.total_stock, selectedStock.unit_of_measurement)}</span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Average Price</span>
                  <span className="summary-value">₱{parseFloat(selectedStock.avg_unit_price).toFixed(2)}</span>
                </div>
                <div className="summary-card">
                  <span className="summary-label">Total Entries</span>
                  <span className="summary-value">{selectedStock.stock_entries}</span>
                </div>
              </div>

              <div className="entries-section">
                <div className="entries-header">
                  <h3>Stock Entries</h3>
                  <span className="entry-count">{stockEntries.length} entries</span>
                </div>

                {stockEntries.length === 0 ? (
                  <p className="no-entries">No stock entries found</p>
                ) : (
                  <div className="entries-list">
                    {stockEntries.map((entry, index) => (
                      <div key={entry.stock_id} className="entry-card">
                        {editMode && index === 0 ? (
                          <EditEntryForm 
                            entry={entry} 
                            categoryName={selectedStock.ingredients?.categories?.category_name}
                            onSave={updateStockEntry}
                            onCancel={() => setEditMode(false)}
                          />
                        ) : (
                          <>
                            <div className="entry-header">
                              <span className="entry-date">
                                📅 {new Date(entry.purchase_date).toLocaleDateString()}
                              </span>
                              <div className="entry-actions">
                                {index === 0 && !editMode && (
                                  <button 
                                    className="edit-btn-small"
                                    onClick={() => setEditMode(true)}
                                  >
                                    ✏️ Edit
                                  </button>
                                )}
                                <button 
                                  className="delete-btn-small"
                                  onClick={() => deleteStockEntry(entry.stock_id)}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                            <div className="entry-details">
                              {usesMassTerminology(selectedStock.ingredients?.categories?.category_name) ? (
                                <>
                                  <div className="entry-row">
                                    <span className="entry-label">Mass:</span>
                                    <span className="entry-value">{entry.container_type}</span>
                                  </div>
                                  <div className="entry-row">
                                    <span className="entry-label">Total:</span>
                                    <span className="entry-value highlight">{formatStockDisplay(entry.total_quantity, selectedStock.unit_of_measurement)}</span>
                                  </div>
                                  <div className="entry-row">
                                    <span className="entry-label">Unit Price:</span>
                                    <span className="entry-value">₱{parseFloat(entry.unit_price).toFixed(2)}/{selectedStock.unit_of_measurement}</span>
                                  </div>
                                  <div className="entry-row">
                                    <span className="entry-label">Total Cost:</span>
                                    <span className="entry-value">₱{(parseFloat(entry.total_quantity) * parseFloat(entry.unit_price)).toFixed(2)}</span>
                                  </div>
                                  {entry.supplier && (
                                    <div className="entry-row">
                                      <span className="entry-label">Supplier:</span>
                                      <span className="entry-value">{entry.supplier}</span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="entry-row">
                                    <span className="entry-label">Container:</span>
                                    <span className="entry-value">{entry.container_type}</span>
                                  </div>
                                  <div className="entry-row">
                                    <span className="entry-label">Quantity:</span>
                                    <span className="entry-value">{parseFloat(parseFloat(entry.quantity_containers).toFixed(3))} containers</span>
                                  </div>
                                  <div className="entry-row">
                                    <span className="entry-label">Size:</span>
                                    <span className="entry-value">{parseFloat(parseFloat(entry.container_size).toFixed(3))} {selectedStock.unit_of_measurement}/container</span>
                                  </div>
                                  <div className="entry-row">
                                    <span className="entry-label">Total:</span>
                                    <span className="entry-value highlight">{formatStockDisplay(entry.total_quantity, selectedStock.unit_of_measurement)}</span>
                                  </div>
                                  <div className="entry-row">
                                    <span className="entry-label">Unit Price:</span>
                                    <span className="entry-value">₱{parseFloat(entry.unit_price).toFixed(2)}</span>
                                  </div>
                                  <div className="entry-row">
                                    <span className="entry-label">Price/Container:</span>
                                    <span className="entry-value">₱{parseFloat(entry.container_price).toFixed(2)}</span>
                                  </div>
                                  {entry.supplier && (
                                    <div className="entry-row">
                                      <span className="entry-label">Supplier:</span>
                                      <span className="entry-value">{entry.supplier}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  )
}

function EditEntryForm({ entry, categoryName, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    ...entry
  })

  const usesMassTerminology = (category) => {
    return ['Meats', 'Vegetables', 'Staples', 'Seafood'].includes(category)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="edit-entry-form">
      <div className="edit-form-grid">
        <div className="edit-form-group">
          <label>{usesMassTerminology(categoryName) ? 'Mass' : 'Container Type'}</label>
          <input
            type="text"
            value={formData.container_type}
            onChange={(e) => setFormData({ ...formData, container_type: e.target.value })}
          />
        </div>
        <div className="edit-form-group">
          <label>Quantity</label>
          <input
            type="number"
            step="0.01"
            value={formData.quantity_containers}
            onChange={(e) => setFormData({ ...formData, quantity_containers: e.target.value })}
          />
        </div>
        <div className="edit-form-group">
          <label>Container Size</label>
          <input
            type="number"
            step="0.01"
            value={formData.container_size}
            onChange={(e) => setFormData({ ...formData, container_size: e.target.value })}
          />
        </div>
        <div className="edit-form-group">
          <label>Price per Container</label>
          <input
            type="number"
            step="0.01"
            value={formData.container_price}
            onChange={(e) => setFormData({ ...formData, container_price: e.target.value })}
          />
        </div>
        <div className="edit-form-group">
          <label>Supplier</label>
          <input
            type="text"
            value={formData.supplier || ''}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          />
        </div>
        <div className="edit-form-group">
          <label>Purchase Date</label>
          <input
            type="date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
          />
        </div>
      </div>
      <div className="edit-form-actions">
        <button type="submit" className="save-btn">💾 Save Changes</button>
        <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
      </div>
    </form>
  )
}

