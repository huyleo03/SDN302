// Re-export all services for easy importing
export { default as authService } from './authService';
export { default as cartService } from './cartService';
export { default as productService } from './productService';
export { default as addressService } from './addressService';
export { default as orderService } from './orderService';
export { default as api } from './api';

// Service aggregator for complex operations
export const serviceManager = {
  // Initialize app services
  init: () => {
    console.log('Services initialized');
  },

  // Cleanup on app unmount
  cleanup: () => {
    console.log('Services cleaned up');
  },
};
