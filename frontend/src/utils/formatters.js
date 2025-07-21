/**
 * Format price to VND currency
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format price to Vietnamese currency
 * @param {number} price - Price to format
 * @returns {string} Formatted price string in VND
 */
export const formatPriceVND = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0 ₫';
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price * 24000); // Assuming 1 USD = 24,000 VND
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (originalPrice <= 0 || discountedPrice < 0) return 0;
  if (discountedPrice >= originalPrice) return 0;
  
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

const formatters = {
  formatPrice,
  formatPriceVND,
  formatNumber,
  calculateDiscountPercentage,
};

export default formatters;
