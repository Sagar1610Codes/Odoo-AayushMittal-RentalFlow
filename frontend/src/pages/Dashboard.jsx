import { useAuth } from '../contexts/AuthContext'
import { Package, ShoppingCart, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react'

function Dashboard() {
  const { user } = useAuth()

  const vendorStats = [
    { icon: Package, label: 'My Products', value: '24', color: 'bg-blue-500' },
    { icon: ShoppingCart, label: 'Total Orders', value: '48', color: 'bg-green-500' },
    { icon: FileText, label: 'Invoices', value: '32', color: 'bg-purple-500' },
    { icon: TrendingUp, label: 'Revenue', value: '₹2.4L', color: 'bg-orange-500' },
  ]

  const customerStats = [
    { icon: Package, label: 'Available Products', value: '124', color: 'bg-blue-500' },
    { icon: ShoppingCart, label: 'My Orders', value: '5', color: 'bg-green-500' },
    { icon: Clock, label: 'Pending', value: '2', color: 'bg-yellow-500' },
    { icon: CheckCircle, label: 'Completed', value: '3', color: 'bg-green-600' },
  ]

  const stats = user?.role === 'VENDOR' ? vendorStats : customerStats

  const vendorActions = [
    { label: 'Add New Product', color: 'bg-blue-50 hover:bg-blue-100' },
    { label: 'View Orders', color: 'bg-green-50 hover:bg-green-100' },
    { label: 'Generate Invoice', color: 'bg-purple-50 hover:bg-purple-100' },
  ]

  const customerActions = [
    { label: 'Browse Products', color: 'bg-blue-50 hover:bg-blue-100' },
    { label: 'View My Orders', color: 'bg-green-50 hover:bg-green-100' },
    { label: 'Track Delivery', color: 'bg-purple-50 hover:bg-purple-100' },
  ]

  const quickActions = user?.role === 'VENDOR' ? vendorActions : customerActions

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'VENDOR' ? 'Vendor Dashboard' : 'Customer Dashboard'}
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.name}! 
          <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
            {user?.role}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            {user?.role === 'VENDOR' ? 'Recent Orders' : 'My Recent Orders'}
          </h2>
          <p className="text-gray-500">No recent orders</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <button 
                key={action.label}
                className={`w-full text-left px-4 py-2 ${action.color} rounded-lg transition`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
