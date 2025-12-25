import { Link } from 'react-router-dom'
import '../styles/Navigation.css'

export default function Navigation() {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>🍽️ KARINDIRYA</h1>
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/">DASHBOARD</Link>
        </li>
        <li>
          <Link to="/menu">MENU</Link>
        </li>
        <li>
          <Link to="/orders">ORDERS</Link>
        </li>
        <li>
          <Link to="/inventory">INVENTORY</Link>
        </li>
      </ul>
    </nav>
  )
}
