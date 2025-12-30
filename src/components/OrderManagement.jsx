import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/OrderManagement.css'

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [archivedOrders, setArchivedOrders] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    items: [],
    paymentMethod: 'cash'
  })

  useEffect(() => {
    fetchOrders()
    fetchMenuItems()
    cleanupOldArchives()
  }, [])

  const cleanupOldArchives = async () => {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      await supabase
        .from('orders')
        .delete()
        .eq('status', 'completed')
        .lt('completed_at', thirtyDaysAgo.toISOString())
    } catch (error) {
      console.error('Error cleaning up old archives:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (menu_name)
          )
        `)
        .in('status', ['pending', 'preparing'])
        .order('order_date', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArchivedOrders = async (date) => {
    try {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            menu_items (menu_name)
          )
        `)
        .eq('status', 'completed')
        .gte('completed_at', startDate.toISOString())
        .lte('completed_at', endDate.toISOString())
        .order('completed_at', { ascending: false })

      if (error) throw error
      setArchivedOrders(data || [])
    } catch (error) {
      console.error('Error fetching archived orders:', error)
    }
  }

  const fetchMenuItems = async () => {
    try {
      // Fetch menu items with their recipes and stock availability
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select(`
          *,
          recipes (
            quantity_needed,
            ingredient_id,
            ingredients (
              ingredient_id,
              ingredient_name,
              unit_of_measurement
            )
          )
        `)
        .eq('is_available', true)
        .order('menu_name')

      if (menuError) throw menuError

      // Check stock availability for each menu item
      const { data: stockData, error: stockError } = await supabase
        .from('current_stock_levels')
        .select('*')

      if (stockError) throw stockError

      // Add stock availability to menu items
      const menuWithStock = menuData.map(menu => {
        // Check if menu has recipes defined
        if (!menu.recipes || menu.recipes.length === 0) {
          return { ...menu, hasStock: true }
        }
        
        // Check if all ingredients have sufficient stock
        const hasStock = menu.recipes.every(recipe => {
          const stock = stockData.find(s => s.ingredient_id === recipe.ingredient_id)
          // Both quantity_needed and total_stock are in kg
          return stock && parseFloat(stock.total_stock) >= parseFloat(recipe.quantity_needed)
        })
        
        return { ...menu, hasStock }
      })

      setMenuItems(menuWithStock || [])
    } catch (error) {
      console.error('Error fetching menu items:', error)
    }
  }

  const addItemToOrder = (menuItem) => {
    if (!menuItem.hasStock) {
      alert(`${menuItem.menu_name} is out of stock or has insufficient ingredients`)
      return
    }

    const existingItem = newOrder.items.find(item => item.menu_id === menuItem.menu_id)
    
    if (existingItem) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map(item =>
          item.menu_id === menuItem.menu_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      })
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, {
          menu_id: menuItem.menu_id,
          menu_name: menuItem.menu_name,
          quantity: 1,
          unit_price: menuItem.selling_price
        }]
      })
    }
    
    // Show success message
    setSuccessMessage(`${menuItem.menu_name} added successfully!`)
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const updateQuantity = (menuId, change) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.map(item =>
        item.menu_id === menuId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    })
  }

  const removeItem = (menuId) => {
    setNewOrder({
      ...newOrder,
      items: newOrder.items.filter(item => item.menu_id !== menuId)
    })
  }

  const calculateTotal = () => {
    return newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  const submitOrder = async () => {
    if (newOrder.items.length === 0) {
      alert('Please add items to the order')
      return
    }

    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}`
      
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: newOrder.customerName || 'Walk-in Customer',
          payment_method: newOrder.paymentMethod,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Add order items
      const orderItems = newOrder.items.map(item => ({
        order_id: orderData.order_id,
        menu_id: item.menu_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Batch collect all ingredients to deduct
      const deductions = []
      for (const item of newOrder.items) {
        const { data: recipes } = await supabase
          .from('recipes')
          .select('quantity_needed, ingredient_id')
          .eq('menu_id', item.menu_id)

        for (const recipe of recipes) {
          const totalNeeded = parseFloat(recipe.quantity_needed) * item.quantity
          deductions.push({ ingredientId: recipe.ingredient_id, quantity: totalNeeded })
        }
      }

      // Deduct all ingredients in parallel with order number for tracking
      await Promise.all(deductions.map(d => deductIngredient(d.ingredientId, d.quantity, orderNumber)))

      // Refresh menu items immediately to update stock status
      await fetchMenuItems()
      
      alert('Order created successfully!')
      setShowNewOrder(false)
      setNewOrder({ customerName: '', items: [], paymentMethod: 'cash' })
      fetchOrders()
    } catch (error) {
      console.error('Error creating order:', error)
      alert(`Error creating order: ${error.message}`)
    }
  }

  const deductIngredient = async (ingredientId, quantityNeeded, orderNumber = null) => {
    try {
      // Get ingredient details and CURRENT TOTAL stock from view
      const { data: ingredient } = await supabase
        .from('ingredients')
        .select('unit_of_measurement, ingredient_name')
        .eq('ingredient_id', ingredientId)
        .single()

      // Get current total stock from the view (this is the accurate total)
      const { data: currentStockData } = await supabase
        .from('current_stock_levels')
        .select('total_stock')
        .eq('ingredient_id', ingredientId)
        .single()

      const totalStockBefore = currentStockData ? parseFloat(currentStockData.total_stock) : 0

      // Get all stock entries for this ingredient, ordered by oldest first (FIFO)
      const { data: stocks, error } = await supabase
        .from('stock_ingredients')
        .select('*')
        .eq('ingredient_id', ingredientId)
        .gt('total_quantity', 0)
        .order('purchase_date', { ascending: true })

      if (error) throw error
      if (!stocks || stocks.length === 0) return

      let remaining = quantityNeeded // quantityNeeded is in kg from recipes table
      let totalDeducted = 0

      for (const stock of stocks) {
        if (remaining <= 0) break

        const available = parseFloat(stock.total_quantity) // total_quantity is in kg
        const containerSize = parseFloat(stock.container_size) // container_size is in kg
        const quantityToDeduct = Math.min(available, remaining)
        
        if (available >= remaining) {
          // This stock can cover the remaining amount
          const newTotalQuantity = available - remaining
          const newContainers = newTotalQuantity / containerSize
          
          await supabase
            .from('stock_ingredients')
            .update({ quantity_containers: Math.max(0, newContainers) })
            .eq('stock_id', stock.stock_id)

          totalDeducted += remaining
          remaining = 0
        } else {
          // Use all of this stock and continue
          await supabase
            .from('stock_ingredients')
            .update({ quantity_containers: 0 })
            .eq('stock_id', stock.stock_id)

          totalDeducted += available
          remaining -= available
        }
      }

      // Log ONE transaction per ingredient with the TOTAL before/after values
      const totalStockAfter = totalStockBefore - totalDeducted
      
      await supabase.from('stock_transactions').insert({
        ingredient_id: ingredientId,
        stock_id: null, // null because this represents total across all stocks
        transaction_type: 'deduction',
        quantity_change: -totalDeducted,
        quantity_before: totalStockBefore,
        quantity_after: totalStockAfter,
        unit_of_measurement: ingredient?.unit_of_measurement || 'kg',
        reference_type: 'order',
        order_number: orderNumber,
        notes: `Deducted for order ${orderNumber || 'N/A'}`
      })
      
      if (remaining > 0) {
        console.warn(`Insufficient stock for ingredient ${ingredientId}. Still need ${remaining}kg`)
      }
    } catch (error) {
      console.error('Error deducting ingredient:', error)
      throw error
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updateData = { status: newStatus }
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('order_id', orderId)

      if (error) throw error
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const filterOrdersByStatus = (status) => {
    return orders.filter(order => order.status === status)
  }

  const handleArchiveClick = (date) => {
    setSelectedDate(date)
    fetchArchivedOrders(date)
    setShowArchive(true)
  }

  const getLast30Days = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  if (loading) {
    return <div className="loading">Loading orders...</div>
  }

  const pendingOrders = filterOrdersByStatus('pending')
  const preparingOrders = filterOrdersByStatus('preparing')

  return (
    <div className="order-management">
      {successMessage && (
        <div className="success-toast">
          ✓ {successMessage}
        </div>
      )}
      
      <div className="order-header">
        <div>
          <h1>🍽️ Order Management</h1>
          <p className="header-subtitle">Manage restaurant orders and track inventory</p>
        </div>
        <div className="header-actions">
          <button className="archive-btn" onClick={() => setShowArchive(!showArchive)}>
            📁 {showArchive ? 'Close Archive' : 'View Archive'}
          </button>
          <button className="new-order-btn" onClick={() => setShowNewOrder(!showNewOrder)}>
            {showNewOrder ? '✕ Cancel' : '+ New Order'}
          </button>
        </div>
      </div>

      {showArchive && (
        <div className="archive-section">
          <h2>📅 Order Archive (Last 30 Days)</h2>
          <div className="date-selector">
            {getLast30Days().map(date => (
              <button
                key={date}
                className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                onClick={() => handleArchiveClick(date)}
              >
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>
          
          {selectedDate && (
            <div className="archived-orders">
              <h3>Orders for {new Date(selectedDate).toLocaleDateString()}</h3>
              {archivedOrders.length === 0 ? (
                <p className="no-orders">No orders for this date</p>
              ) : (
                <div className="orders-grid">
                  {archivedOrders.map(order => (
                    <OrderCard key={order.order_id} order={order} isArchive={true} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showNewOrder && (
        <div className="new-order-form">
          <h2>📝 Create New Order</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                placeholder="Enter customer name (optional)"
                value={newOrder.customerName}
                onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={newOrder.paymentMethod}
                onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
              >
                <option value="cash">💵 Cash</option>
                <option value="gcash">📱 GCash</option>
                <option value="card">💳 Card</option>
              </select>
            </div>
          </div>

          <div className="menu-selection">
            <h3>🍴 Select Menu Items</h3>
            <div className="menu-grid">
              {menuItems.map(item => (
                <div 
                  key={item.menu_id} 
                  className={`menu-item ${!item.hasStock ? 'out-of-stock' : ''}`}
                  onClick={() => addItemToOrder(item)}
                >
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/200?text=No+Image'} 
                    alt={item.menu_name}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/200?text=No+Image'}
                  />
                  <div className="menu-item-content">
                    <p className="menu-item-name">{item.menu_name}</p>
                    <span className="menu-item-price">₱{parseFloat(item.selling_price).toFixed(2)}</span>
                  </div>
                  {!item.hasStock && <div className="stock-badge out-of-stock">Out of Stock</div>}
                  {item.hasStock && <div className="stock-badge in-stock">Available</div>}
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary">
            <h3>🛒 Order Summary</h3>
            {newOrder.items.length === 0 ? (
              <p className="empty-order">No items added yet</p>
            ) : (
              <>
                <div className="order-items-list">
                  {newOrder.items.map(item => (
                    <div key={item.menu_id} className="order-item">
                      <span className="item-name">{item.menu_name}</span>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.menu_id, -1)}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.menu_id, 1)}>+</button>
                      </div>
                      <span className="item-price">₱{(item.quantity * item.unit_price).toFixed(2)}</span>
                      <button className="remove-btn" onClick={() => removeItem(item.menu_id)}>✕</button>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span>Total Amount:</span>
                  <strong>₱{calculateTotal().toFixed(2)}</strong>
                </div>
                <button className="submit-order-btn" onClick={submitOrder}>
                  ✓ Submit Order
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="orders-sections">
        <div className="section pending-section">
          <div className="section-header">
            <h2>⏳ Pending Orders</h2>
            <span className="count-badge">{pendingOrders.length}</span>
          </div>
          {pendingOrders.length === 0 ? (
            <p className="no-orders">No pending orders</p>
          ) : (
            <div className="orders-grid">
              {pendingOrders.map(order => (
                <OrderCard 
                  key={order.order_id} 
                  order={order} 
                  onUpdateStatus={updateOrderStatus}
                />
              ))}
            </div>
          )}
        </div>

        <div className="section preparing-section">
          <div className="section-header">
            <h2>👨‍🍳 Preparing Orders</h2>
            <span className="count-badge">{preparingOrders.length}</span>
          </div>
          {preparingOrders.length === 0 ? (
            <p className="no-orders">No orders being prepared</p>
          ) : (
            <div className="orders-grid">
              {preparingOrders.map(order => (
                <OrderCard 
                  key={order.order_id} 
                  order={order} 
                  onUpdateStatus={updateOrderStatus}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Order Card Component
function OrderCard({ order, onUpdateStatus, isArchive = false }) {
  return (
    <div className={`order-card ${order.status}`}>
      <div className="order-card-header">
        <div>
          <strong className="order-number">{order.order_number}</strong>
          <p className="customer-name">{order.customer_name || 'Walk-in Customer'}</p>
        </div>
        <span className={`status-badge ${order.status}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="order-card-body">
        <div className="order-meta">
          <span className="order-date">
            📅 {new Date(order.order_date).toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          <span className="payment-method">💳 {order.payment_method}</span>
        </div>

        <div className="order-items-list">
          {order.order_items?.map(item => (
            <div key={item.order_item_id} className="item-detail">
              <span className="item-qty">{item.quantity}x</span>
              <span className="item-name">{item.menu_items?.menu_name}</span>
            </div>
          ))}
        </div>

        <div className="order-total">
          <span>Total:</span>
          <strong>₱{parseFloat(order.total_amount).toFixed(2)}</strong>
        </div>
      </div>

      {!isArchive && (
        <div className="order-card-actions">
          {order.status === 'pending' && (
            <>
              <button 
                className="action-btn start-btn"
                onClick={() => onUpdateStatus(order.order_id, 'preparing')}
              >
                🔥 Start Preparing
              </button>
              <button 
                className="action-btn cancel-btn"
                onClick={() => onUpdateStatus(order.order_id, 'cancelled')}
              >
                ✕ Cancel
              </button>
            </>
          )}
          {order.status === 'preparing' && (
            <button 
              className="action-btn complete-btn"
              onClick={() => onUpdateStatus(order.order_id, 'completed')}
            >
              ✓ Mark Complete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
