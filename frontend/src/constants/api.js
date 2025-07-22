// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PRODUCTS: {
    ALL: '/api/products/all',
    BY_ID: (id) => `/api/products/${id}`,
    SEARCH: '/api/products/search',
    BY_CATEGORY: (categoryId) => `/api/products/category/${categoryId}`,
    FEATURED: '/api/products/featured',
    MY_PRODUCTS: '/api/products/my-products',
    CREATE: '/api/products',
    UPDATE: (id) => `/api/products/${id}`,
    DELETE: (id) => `/api/products/${id}`,
  },
  CART: {
    GET: '/api/cart',
    ADD: '/api/cart/add',
    UPDATE: '/api/cart/update',
    REMOVE: (productId) => `/api/cart/remove/${productId}`,
    CLEAR: '/api/cart/clear',
    CHECKOUT: '/api/cart/checkout',
  },
  ORDERS: {
    ALL: '/api/orders',
    BY_ID: (id) => `/api/orders/${id}`,
    CREATE: '/api/orders',
    UPDATE: (id) => `/api/orders/${id}`,
    CANCEL: (id) => `/api/orders/${id}/cancel`,
  },
};

// Application routes
export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  CHECKOUT: '/checkout',
  SEARCH: '/search',
  CATEGORY: '/category/:id',
  SELLER_DASHBOARD: '/seller',
  ADMIN_DASHBOARD: '/admin',
  NOT_FOUND: '/404',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recent_searches',
  FAVORITES: 'favorites',
};

// Theme constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Supported languages
export const LANGUAGES = {
  VI: 'vi',
  EN: 'en',
};

const constants = {
  API_ENDPOINTS,
  ROUTES,
  HTTP_STATUS,
  STORAGE_KEYS,
  THEMES,
  LANGUAGES,
};

export default constants;
