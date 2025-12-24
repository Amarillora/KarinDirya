import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayRevenue: 0,
    lowStockItems: 0,
    popularDishes: []
  })
  const [revenueData, setRevenueData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Get today's orders
      const today = new Date().toISOString().split('T')[0]
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('order_date', today)
        .eq('status', 'completed')

      if (ordersError) {
        console.error('Orders error:', ordersError)
        setLoading(false)
        return
      }

      // Calculate revenue
      const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)

      // Get popular dishes
      const { data: popularDishes, error: popularError } = await supabase
        .from('order_items')
        .select(`
          menu_id,
          quantity,
          menu_items (menu_name, image_url)
        `)
        .limit(5)

      if (popularError) {
        console.error('Popular dishes error:', popularError)
      }

      // Get last 7 days revenue for graph
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      const { data: revenueOrders, error: revenueError } = await supabase
        .from('orders')
        .select('order_date, total_amount')
        .gte('order_date', sevenDaysAgo.toISOString().split('T')[0])
        .eq('status', 'completed')
        .order('order_date', { ascending: true })

      if (!revenueError && revenueOrders) {
        // Group by date and sum revenue
        const revenueByDate = {}
        revenueOrders.forEach(order => {
          const date = new Date(order.order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          revenueByDate[date] = (revenueByDate[date] || 0) + parseFloat(order.total_amount || 0)
        })
        setRevenueData(Object.entries(revenueByDate).map(([date, amount]) => ({ date, amount })))
      }

      setStats({
        totalOrders: orders.length,
        todayRevenue: revenue,
        lowStockItems: 0, // You can implement this by querying stock levels
        popularDishes: popularDishes || []
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today&apos;s Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        
        <div className="stat-card">
          <h3>Today&apos;s Revenue</h3>
          <p className="stat-value">₱{stats.todayRevenue.toFixed(2)}</p>
        </div>
        
        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <p className="stat-value">{stats.lowStockItems}</p>
        </div>
        
        <div className="stat-card">
          <h3>Active Menu Items</h3>
          <p className="stat-value">10</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Revenue Trend (Last 7 Days)</h2>
        <div className="revenue-graph">
          {revenueData.length > 0 ? (
            <div className="graph-bars">
              {revenueData.map((data, index) => {
                const maxRevenue = Math.max(...revenueData.map(d => d.amount))
                const height = maxRevenue > 0 ? (data.amount / maxRevenue) * 100 : 0
                return (
                  <div key={index} className="bar-container">
                    <div className="bar-wrapper">
                      <div 
                        className="bar" 
                        style={{ height: `${height}%` }}
                      >
                        <span className="bar-value">₱{data.amount.toFixed(0)}</span>
                      </div>
                    </div>
                    <span className="bar-label">{data.date}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="no-data">No revenue data available</p>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => navigate('/orders')}>New Order</button>
          <button className="action-btn" onClick={() => navigate('/inventory')}>Add Stock</button>
          <button className="action-btn" onClick={() => navigate('/menu')}>View Menu</button>
        </div>
      </div>
    </div>
  )
}
