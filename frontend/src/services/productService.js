import api from './api';

export const productService = {
  // Get all products with filters
  getAllProducts: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/api/products/all?${queryString}` : '/api/products/all';
    
    const response = await api.get(url);
    return response.data;
  },

  // Get product by ID
  getProductById: async (productId) => {
    const response = await api.get(`/api/products/${productId}`);
    return response.data;
  },

  // Search products
  searchProducts: async (searchTerm, filters = {}) => {
    const response = await api.get('/api/products/search', {
      params: {
        q: searchTerm,
        ...filters,
      },
    });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`/api/products/category/${categoryId}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async () => {
    const response = await api.get('/api/products/featured');
    return response.data;
  },

  // Get user's products (for sellers)
  getUserProducts: async () => {
    const response = await api.get('/api/products/my-products');
    return response.data;
  },

  // Create new product (for sellers)
  createProduct: async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  // Update product (for sellers)
  updateProduct: async (productId, productData) => {
    const response = await api.put(`/api/products/${productId}`, productData);
    return response.data;
  },

  // Delete product (for sellers)
  deleteProduct: async (productId) => {
    const response = await api.delete(`/api/products/${productId}`);
    return response.data;
  },
};

export default productService;
