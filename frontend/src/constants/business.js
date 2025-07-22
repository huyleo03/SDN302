// Product related constants
export const PRODUCT_STATUS = {
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
  PENDING: 'pending',
};

export const PRODUCT_SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRICE_LOW_TO_HIGH: 'price-low',
  PRICE_HIGH_TO_LOW: 'price-high',
  NAME_A_TO_Z: 'name-asc',
  NAME_Z_TO_A: 'name-desc',
  RATING: 'rating',
  POPULARITY: 'popularity',
};

export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  FASHION: 'fashion',
  HOME: 'home',
  SPORTS: 'sports',
  BOOKS: 'books',
  TOYS: 'toys',
  BEAUTY: 'beauty',
  AUTOMOTIVE: 'automotive',
};

// Cart related constants
export const CART_ITEM_STATUS = {
  ACTIVE: 'active',
  SAVED_FOR_LATER: 'saved_for_later',
  UNAVAILABLE: 'unavailable',
};

export const CART_LIMITS = {
  MAX_QUANTITY_PER_ITEM: 99,
  MIN_QUANTITY_PER_ITEM: 1,
  MAX_ITEMS_IN_CART: 50,
};

// Order related constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cash_on_delivery',
};

// User related constants
export const USER_ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Form validation constants
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PRODUCT_TITLE_MAX_LENGTH: 200,
  PRODUCT_DESCRIPTION_MAX_LENGTH: 2000,
  REVIEW_MAX_LENGTH: 1000,
};

// File upload constants
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_IMAGES_PER_PRODUCT: 10,
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [12, 24, 36, 48],
};

const businessConstants = {
  PRODUCT_STATUS,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_CATEGORIES,
  CART_ITEM_STATUS,
  CART_LIMITS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  USER_ROLES,
  USER_STATUS,
  NOTIFICATION_TYPES,
  VALIDATION_RULES,
  FILE_UPLOAD,
  PAGINATION,
};

export default businessConstants;
