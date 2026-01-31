import api from './api'

export const getVendorStats = async () => {
  try {
    const productsResponse = await api.get('/products')
    const ordersResponse = await api.get('/orders')

    const products = productsResponse.data.data?.products || []
    const orders = ordersResponse.data.data || []

    const totalProducts = productsResponse.data.data?.total || products.length
    const totalOrders = orders.length
    const revenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)

    return {
      productCount: totalProducts,
      orderCount: totalOrders,
      revenue: revenue,
      invoiceCount: orders.filter(o => o.status === 'COMPLETED').length
    }
  } catch (error) {
    console.error('Failed to fetch vendor stats')
    throw error
  }
}

export const getCustomerStats = async () => {
  try {
    const productsResponse = await api.get('/products')
    const ordersResponse = await api.get('/orders')

    const products = productsResponse.data.data?.products || []
    const orders = ordersResponse.data.data || []

    const totalProducts = productsResponse.data.data?.total || products.length
    const myOrders = orders.length
    const pending = orders.filter(o => o.status === 'PENDING').length
    const completed = orders.filter(o => o.status === 'COMPLETED').length

    return {
      availableProducts: totalProducts,
      myOrders: myOrders,
      pending: pending,
      completed: completed
    }
  } catch (error) {
    console.error('Failed to fetch customer stats')
    throw error
  }
}

export const getRecentOrders = async (limit = 5) => {
  try {
    const response = await api.get(`/orders?limit=${limit}`)
    return response.data.data || []
  } catch (error) {
    console.error('Failed to fetch recent orders')
    throw error
  }
}
