import { Link } from 'react-router-dom'
import { Home, Package, ShoppingCart, LogIn } from 'lucide-react'
import { cn } from '../../utils/cn'

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Package className="w-8 h-8" />
            Rental ERP
          </Link>
          
          <div className="flex gap-6 items-center">
            <Link to="/" className={cn("flex items-center gap-2 text-gray-700 hover:text-blue-600 transition")}>
              <Home className="w-5 h-5" />
              Home
            </Link>
            <Link to="/products" className={cn("flex items-center gap-2 text-gray-700 hover:text-blue-600 transition")}>
              <Package className="w-5 h-5" />
              Products
            </Link>
            <Link to="/orders" className={cn("flex items-center gap-2 text-gray-700 hover:text-blue-600 transition")}>
              <ShoppingCart className="w-5 h-5" />
              Orders
            </Link>
            <Link to="/login" className={cn("flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition")}>
              <LogIn className="w-5 h-5" />
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
