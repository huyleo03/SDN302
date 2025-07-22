import api from "./api";

// Create order
export const createOrder = async (orderData) => {
  const response = await api.post("/api/orders", orderData);
  return response.data;
};

// Get user orders
export const getUserOrders = async () => {
  const response = await api.get("/api/orders");
  return response.data;
};

// Get order by ID
export const getOrderById = async (orderId) => {
  const response = await api.get(`/api/orders/${orderId}`);
  return response.data;
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/api/orders/${orderId}/status`, { status });
  return response.data;
};

// Cancel order
export const cancelOrder = async (orderId) => {
  const response = await api.patch(`/api/orders/${orderId}/cancel`);
  return response.data;
};

const orderService = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};

export default orderService;
