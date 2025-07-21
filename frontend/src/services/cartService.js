import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/api/cart');
    return response.data;
  },

  addToCart: async (productId, quantity = 1) => {
    const response = await api.post('/cart/add', {
      productId,
      quantity,
    });
    return response.data;
  },

  updateQuantity: async (productId, quantity) => {
    const response = await api.put('/api/cart/update', {
      productId,
      quantity,
    });
    return response.data;
  },

  removeFromCart: async (productId) => {
    const response = await api.delete(`/api/cart/remove/${productId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/api/cart/clear');
    return response.data;
  },

  checkout: async (checkoutData) => {
    const response = await api.post('/api/cart/checkout', checkoutData);
    return response.data;
  },
};

export default cartService;
