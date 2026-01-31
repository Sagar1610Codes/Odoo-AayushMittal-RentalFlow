import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

function Reservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/reservations')
      setReservations(response.data.data || [])
    } catch (err) {
      setError('Failed to load reservations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return
    }

    try {
      await api.delete(`/reservations/${reservationId}`)
      await fetchReservations()
    } catch (err) {
      alert('Failed to cancel reservation')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredReservations = statusFilter === 'ALL'
    ? reservations
    : reservations.filter(reservation => reservation.status === statusFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
          <p className="text-gray-600 mt-1">
            {filteredReservations.length} {filteredReservations.length === 1 ? 'reservation' : 'reservations'}
          </p>
        </div>
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {filteredReservations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">No reservations found</p>
          <a
            href="/products"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Products
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReservations.map((reservation) => (
            <div key={reservation.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Reservation #{reservation.id}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(reservation.status)}`}>
                  {reservation.status}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Product</p>
                  <p className="font-medium">{reservation.product_name || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{formatDate(reservation.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">{formatDate(reservation.end_date)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">
                      {calculateDuration(reservation.start_date, reservation.end_date)} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="font-medium">{reservation.quantity}</p>
                  </div>
                </div>

                {reservation.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCancelReservation(reservation.id)}
                    className="w-full mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Reservations
