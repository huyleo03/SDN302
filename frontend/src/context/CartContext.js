import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, getToken } = authContext || { isAuthenticated: false, getToken: () => null };
  
  const [cartData, setCartData] = useState({
    items: [],
    totalItems: 0,
    totalPrice: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setCartData({
          items: [],
          totalItems: 0,
          totalPrice: 0
        });
        return;
      }

      try {
        setLoading(true);
        const token = getToken();
        const response = await axios.get('http://localhost:9999/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const cart = response.data.data || { items: [], totalItems: 0, totalAmount: 0 };
          
          setCartData({
            items: cart.items || [],
            totalItems: cart.totalItems || 0,
            totalPrice: cart.totalAmount || 0
          });
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartData({
          items: [],
          totalItems: 0,
          totalPrice: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, getToken]);

  const addToCart = async (productId, quantity = 1) => {
    console.log("🛒 CartContext.addToCart called with:", { productId, quantity });
    console.log("- isAuthenticated:", isAuthenticated);
    
    if (!isAuthenticated) {
      console.warn('❌ User not authenticated, cannot add to cart');
      return false;
    }

    try {
      setLoading(true);
      const token = getToken();
      console.log("- token:", token ? "exists" : "missing");
      
      console.log("🌐 Making API call to:", 'http://localhost:9999/api/cart/add');
      console.log("- payload:", { productId, quantity });
      
      const response = await axios.post(
        'http://localhost:9999/api/cart/add',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ API Response:", response.data);

      if (response.data.success) {
        const cart = response.data.data.cart || response.data.data;
        setCartData({
          items: cart.items || [],
          totalItems: cart.totalItems || 0,
          totalPrice: cart.totalAmount || 0
        });
        return true;
      }
      console.error("❌ API returned success=false:", response.data);
      return false;
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      console.error('- error.response:', error.response?.data);
      console.error('- error.status:', error.response?.status);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.delete(
        `http://localhost:9999/api/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const cart = response.data.data.cart || response.data.data;
        setCartData({
          items: cart.items || [],
          totalItems: cart.totalItems || 0,
          totalPrice: cart.totalAmount || 0
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return false;

    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.put(
        'http://localhost:9999/api/cart/update',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const cart = response.data.data.cart || response.data.data;
        setCartData({
          items: cart.items || [],
          totalItems: cart.totalItems || 0,
          totalPrice: cart.totalAmount || 0
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.delete('http://localhost:9999/api/cart/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCartData({
          items: [],
          totalItems: 0,
          totalPrice: 0
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantity = (productId) => {
    const item = cartData.items.find(item => 
      (item.productId?._id || item.productId) === productId
    );
    return item ? item.quantity : 0;
  };

  const refreshCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get('http://localhost:9999/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const cart = response.data.data || { items: [], totalItems: 0, totalAmount: 0 };
        setCartData({
          items: cart.items || [],
          totalItems: cart.totalItems || 0,
          totalPrice: cart.totalAmount || 0
        });
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    items: cartData.items,
    totalItems: cartData.totalItems,
    totalPrice: cartData.totalPrice,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    refreshCart,
    isAuthenticated
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
