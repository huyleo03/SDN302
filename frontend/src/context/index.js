import React, { createContext } from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  );
}
export default AppContext;
