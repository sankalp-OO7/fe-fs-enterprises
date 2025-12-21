import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
   const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Load cart from localStorage on hook initialization
  useEffect(() => {
    const savedCart = localStorage.getItem('productCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('productCart', JSON.stringify(cart));
  }, [cart]);

  // Get total number of items in cart
  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total value of all items in cart
  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + (item.variant.price * item.quantity), 0);
  };

  // Add multiple variants to cart at once
const addMultipleVariantsToCart = (product, selectedVariantIds, quantities) => {
  setCart(prevCart => {
    const updatedCart = [...prevCart];

    for (const variantId of selectedVariantIds) {
      const variant = product.variants.find(v => v._id === variantId);
      if (!variant) continue;

      const quantityToAdd = quantities[variantId] || 1;

      const existingIndex = updatedCart.findIndex(
        item => item.product._id === product._id && item.variant._id === variantId
      );

      if (existingIndex !== -1) {
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + quantityToAdd,
        };
      } else {
        updatedCart.push({
          id: `${product._id}-${variant._id}`,
          product,
          variant,
          quantity: quantityToAdd,
        });
      }
    }

    return updatedCart;
  });
};



  // Add single item to cart (for backward compatibility)
  const addItemToCart = (product, variant, quantity = 1) => {
    if (!variant || variant.stockQty === 0) return;

    const existingItemIndex = cart.findIndex(
      item => item.product._id === product._id && item.variant._id === variant._id
    );

    let updatedCart;
    if (existingItemIndex > -1) {
      // Update existing item quantity
      updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem = {
        id: `${product._id}-${variant._id}`,
        product,
        variant,
        quantity,
      };
      updatedCart = [...cart, newItem];
    }

    setCart(updatedCart);
    setSnackbarMessage(`${product.name} added to cart!`);
    setSnackbarOpen(true);
  };

  // Update quantity of specific cart item
  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    setSnackbarMessage("Cart cleared!");
    setSnackbarOpen(true);
  };

  // Check if product variant is in cart
  const isInCart = (productId, variantId) => {
    return cart.some(item => 
      item.product._id === productId && item.variant._id === variantId
    );
  };

  // Get quantity of specific product variant in cart
  const getCartItemQuantity = (productId, variantId) => {
    const item = cart.find(item => 
      item.product._id === productId && item.variant._id === variantId
    );
    return item ? item.quantity : 0;
  };

  // Cart dialog controls
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  // Snackbar controls
  const closeSnackbar = () => setSnackbarOpen(false);
  const showMessage = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addMultipleVariantsToCart,
        addItemToCart,
        getTotalCartItems,
        getTotalCartValue,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        cartOpen,
        openCart,
        closeCart,
        snackbarOpen,
        snackbarMessage,
        closeSnackbar,
        showMessage,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
