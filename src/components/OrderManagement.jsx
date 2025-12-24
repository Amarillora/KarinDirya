import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/OrderManagement.css'

export default function OrderManagement() {
  const [orders, setOrders] = useState([])
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewOrder, setShowNewOrder] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    items: [],
    paymentMethod: 'cash'
  })

  useEffect(() => {
    fetchOrders()
    fetchMenuItems()
  }, [])

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
        .order('order_date', { ascending: false })
        .limit(20)

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('menu_name')

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error('Error fetching menu items:', error)
    }
  }

  const addItemToOrder = (menuItem) => {
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

      alert('Order created successfully!')
      setShowNewOrder(false)
      setNewOrder({ customerName: '', items: [], paymentMethod: 'cash' })
      fetchOrders()
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Error creating order')
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

  if (loading) {
    return <div className="loading">Loading orders...</div>
  }

  return (
    <div className="order-management">
      <div className="order-header">
        <h1>Order Management</h1>
        <button className="new-order-btn" onClick={() => setShowNewOrder(!showNewOrder)}>
          {showNewOrder ? 'Cancel' : '+ New Order'}
        </button>
      </div>

      {showNewOrder && (
        <div className="new-order-section">
          <h2>Create New Order</h2>
          <div className="order-form">
            <input
              type="text"
              placeholder="Customer Name (Optional)"
              value={newOrder.customerName}
              onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
            />
            <select
              value={newOrder.paymentMethod}
              onChange={(e) => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div className="menu-selection">
            <h3>Select Items</h3>
            <div className="menu-items-grid">
              {menuItems.map(item => (
                <div key={item.menu_id} className="menu-item-card" onClick={() => addItemToOrder(item)}>
                  <img src={item.image_url} alt={item.menu_name} />
                  <p>{item.menu_name}</p>
                  <span>₱{parseFloat(item.selling_price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary">
            <h3>Order Items</h3>
            {newOrder.items.length === 0 ? (
              <p className="empty-order">No items added</p>
            ) : (
              <>
                {newOrder.items.map(item => (
                  <div key={item.menu_id} className="order-item">
                    <span className="item-name">{item.menu_name}</span>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.menu_id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.menu_id, 1)}>+</button>
                    </div>
                    <span className="item-price">₱{(item.quantity * item.unit_price).toFixed(2)}</span>
                    <button className="remove-btn" onClick={() => removeItem(item.menu_id)}>✕</button>
                  </div>
                ))}
                <div className="order-total">
                  <strong>Total: ₱{calculateTotal().toFixed(2)}</strong>
                </div>
                <button className="submit-order-btn" onClick={submitOrder}>Submit Order</button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="orders-list">
        <h2>Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="no-orders">No orders yet</p>
        ) : (
          <div className="orders-table">
            {orders.map(order => (
              <div key={order.order_id} className="order-card">
                <div className="order-info">
                  <div>
                    <strong>{order.order_number}</strong>
                    <p>{order.customer_name || 'Walk-in Customer'}</p>
                    <small>{new Date(order.order_date).toLocaleString()}</small>
                  </div>
                  <div>
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                    <p className="order-total">₱{parseFloat(order.total_amount).toFixed(2)}</p>
                  </div>
                </div>
                <div className="order-items-list">
                  {order.order_items?.map(item => (
                    <div key={item.order_item_id} className="item-detail">
                      {item.quantity}x {item.menu_items?.menu_name}
                    </div>
                  ))}
                </div>
                <div className="order-actions">
                  {order.status === 'pending' && (
                    <button onClick={() => updateOrderStatus(order.order_id, 'preparing')}>
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateOrderStatus(order.order_id, 'completed')}>
                      Mark Complete
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button className="cancel-btn" onClick={() => updateOrderStatus(order.order_id, 'cancelled')}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
