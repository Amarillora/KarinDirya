import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import '../styles/Dashboard.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    lowStockItems: 0,
    activeMenuItems: 0
  })
  const [revenueData, setRevenueData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]

      // Get today's orders (all statuses for count)
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('order_id, total_amount, status')
        .gte('order_date', todayStr)

      if (ordersError) throw ordersError

      // Calculate today's revenue (only completed orders)
      const completedToday = todayOrders.filter(o => o.status === 'completed')
      const todayRevenue = completedToday.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0)

      // Get low stock items (items with less than 5 units)
      const { data: stockData, error: stockError } = await supabase
        .from('current_stock_levels')
        .select('ingredient_id, total_stock')

      let lowStockCount = 0
      if (!stockError && stockData) {
        lowStockCount = stockData.filter(item => parseFloat(item.total_stock) < 5).length
      }

      // Get active menu items count
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('menu_id')
        .eq('is_available', true)

      const activeMenuCount = menuData ? menuData.length : 0

      // Get last 7 days revenue for graph
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      const { data: revenueOrders, error: revenueError } = await supabase
        .from('orders')
        .select('order_date, total_amount, completed_at')
        .gte('order_date', sevenDaysAgo.toISOString().split('T')[0])
        .eq('status', 'completed')
        .order('order_date', { ascending: true })

      if (!revenueError && revenueOrders) {
        // Create revenue by date for last 7 days
        const last7Days = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          const dayRevenue = revenueOrders
            .filter(o => {
              // Extract just the date part from order_date (remove time portion)
              const orderDate = o.order_date.split('T')[0]
              return orderDate === dateStr
            })
            .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
          
          last7Days.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount: dayRevenue
          })
        }
        setRevenueData(last7Days)
      }

      // Get order distribution by status for doughnut chart
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('status')
        .in('status', ['pending', 'preparing', 'completed'])

      if (!allOrdersError && allOrders) {
        const statusCounts = {
          pending: 0,
          preparing: 0,
          completed: 0
        }
        allOrders.forEach(order => {
          statusCounts[order.status]++
        })
        setCategoryData([
          { label: 'Pending', count: statusCounts.pending },
          { label: 'Preparing', count: statusCounts.preparing },
          { label: 'Completed', count: statusCounts.completed }
        ])
      }

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue: todayRevenue,
        lowStockItems: lowStockCount,
        activeMenuItems: activeMenuCount
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

  // Chart.js configuration
  const barChartData = {
    labels: revenueData.map(d => d.date),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.map(d => d.amount),
        backgroundColor: 'rgba(183, 65, 14, 0.9)',
        borderColor: '#B7410E',
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 40,
        maxBarThickness: 50,
      }
    ]
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: '#B7410E',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return '₱' + context.parsed.y.toFixed(2)
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        ticks: {
          stepSize: 2000,
          callback: function(value) {
            return '₱' + value.toLocaleString()
          },
          font: {
            size: 12,
            weight: '500'
          },
          color: '#666'
        },
        grid: {
          color: 'rgba(183, 65, 14, 0.1)',
          lineWidth: 1
        },
        border: {
          display: true,
          color: '#ddd'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12,
            weight: '500'
          },
          color: '#666'
        },
        grid: {
          display: false
        },
        border: {
          display: true,
          color: '#ddd'
        }
      }
    }
  }

  const doughnutChartData = {
    labels: categoryData.map(d => d.label),
    datasets: [
      {
        data: categoryData.map(d => d.count),
        backgroundColor: [
          'rgba(183, 65, 14, 0.8)',  // Terracotta - Pending
          'rgba(133, 187, 101, 0.8)', // Bamboo Green - Preparing
          'rgba(39, 174, 96, 0.8)'    // Success Green - Completed
        ],
        borderColor: [
          '#B7410E',
          '#85BB65',
          '#27ae60'
        ],
        borderWidth: 2
      }
    ]
  }

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: '#B7410E',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12
      }
    }
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Today&apos;s Orders</h3>
          <p className="stat-value">{stats.todayOrders}</p>
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
          <p className="stat-value">{stats.activeMenuItems}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="dashboard-section chart-section">
          <h2>📊 Revenue Trend (Last 7 Days)</h2>
          <div className="chart-wrapper">
            {revenueData.length > 0 ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <p className="no-data">No revenue data available</p>
            )}
          </div>
        </div>

        <div className="dashboard-section chart-section">
          <h2>📈 Order Status Distribution</h2>
          <div className="chart-wrapper doughnut-wrapper">
            {categoryData.length > 0 ? (
              <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
            ) : (
              <p className="no-data">No order data available</p>
            )}
          </div>
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
