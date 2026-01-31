import { Outlet, Link } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-blue-600">
            Rental ERP
          </Link>
          <p className="mt-2 text-gray-600">Rental Management Platform</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Outlet />
        </div>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          © 2026 Rental ERP. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default AuthLayout
