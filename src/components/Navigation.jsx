import React, { useState } from "react";
import useAuth from "../context/useAuth";
import { useCart } from "../context/CartContext";
import { AppBar, Toolbar, Box } from "@mui/material";
import NavBrand from "./navigation/NavBrand.jsx";
import DesktopNav from "./navigation/DesktopNav.jsx";
import MobileNav from "./navigation/MobileNav.jsx";
import CartDialog from "./navigation/CartDialog.jsx";
import LogoutDialog from "./navigation/LogoutDialog.jsx";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const {
    cart,
    cartOpen,
    getTotalCartItems,
    getTotalCartValue,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    openCart,
    closeCart,
  } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);

  const handleMobileToggle = () => setMobileOpen(!mobileOpen);
  const handleLogoutClick = () => {
    setProfileMenuAnchor(null);
    setLogoutDialogOpen(true);
  };
  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    navigate("/");
    logout();
  };

  const cartProps = {
    cart,
    cartOpen,
    getTotalCartItems,
    getTotalCartValue,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    closeCart,
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Toolbar sx={{ py: { xs: 1, sm: 1.5 } }}>
          <NavBrand />

          <Box sx={{ flexGrow: 1 }} />

          <DesktopNav
            user={user}
            isAdmin={isAdmin}
            getTotalCartItems={getTotalCartItems}
            openCart={openCart}
            handleLogoutClick={handleLogoutClick}
            profileMenuAnchor={profileMenuAnchor}
            setProfileMenuAnchor={setProfileMenuAnchor}
            cartProps={cartProps}
          />

          <MobileNav
            user={user}
            isAdmin={isAdmin}
            mobileOpen={mobileOpen}
            handleMobileToggle={handleMobileToggle}
            getTotalCartItems={getTotalCartItems}
            openCart={openCart}
            handleLogoutClick={handleLogoutClick}
          />
        </Toolbar>
      </AppBar>

      <CartDialog {...cartProps} />

      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Navigation;
