import { Link } from 'react-router-dom'
import '../styles/Navigation.css'

export default function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>🍽️ Karindirya</h2>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/menu">Menu</Link>
        </li>
        <li>
          <Link to="/orders">Orders</Link>
        </li>
        <li>
          <Link to="/inventory">Inventory</Link>
        </li>
      </ul>
    </nav>
  )
}
