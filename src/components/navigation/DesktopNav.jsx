import React from "react";
import { Box, Button, IconButton, Badge } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  ShoppingCart,
  Inventory,
  People,
  ListAlt,
  Login,
  PersonAdd,
} from "@mui/icons-material";
import ProfileMenu from "./ProfileMenu";

const navButtonStyle = {
  color: "white",
  px: 2.5,
  py: 1,
  borderRadius: 2,
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 600,
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.15)",
    transform: "translateY(-2px)",
  },
};

const DesktopNav = ({
  user,
  isAdmin,
  getTotalCartItems,
  openCart,
  handleLogoutClick,
  profileMenuAnchor,
  setProfileMenuAnchor,
  cartProps,
}) => {
  console.log(cartProps, "cartProps in DesktopNav");
  
  return (
    <Box
      sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}
    >
      {user ? (
        <>
          {isAdmin() && (
            <Button
              component={RouterLink}
              to="/adminOrders"
              startIcon={<ListAlt />}
              sx={navButtonStyle}
            >
              Memo Management
            </Button>
          )}

          <Button
            component={RouterLink}
            to="/products"
            startIcon={<Inventory />}
            sx={navButtonStyle}
          >
            Products
          </Button>

          {isAdmin() && (
            <Button
              component={RouterLink}
              to="/users"
              startIcon={<People />}
              sx={navButtonStyle}
            >
              Users
            </Button>
          )}

          {!isAdmin() && (
            <Button
              component={RouterLink}
              to="/UserMemo"
              state={{ cart: cartProps.cart }}
              startIcon={<ListAlt />}
              sx={{
                ...navButtonStyle,
                minWidth: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
              aria-label={`Memo (${getTotalCartItems()} items)`}
            >
              <Box sx={{ display: "flex", alignItems: "top", gap: 2.7 }}>
                <Box component="span">Memo</Box>
                {getTotalCartItems() > 0 && (
                  <Badge
                    badgeContent={getTotalCartItems()}
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        transform: "scale(0.95)",
                        minWidth: 20,
                        height: 20,
                        borderRadius: "10px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        boxShadow: (theme) =>
                          `0 0 0 2px ${theme.palette.background.paper}`,
                      },
                    }}
                    aria-hidden={false}
                    aria-label={`${getTotalCartItems()} items in memo`}
                  />
                )}
              </Box>
            </Button>
          )}

          <ProfileMenu
            user={user}
            isAdmin={isAdmin}
            anchorEl={profileMenuAnchor}
            setAnchorEl={setProfileMenuAnchor}
            handleLogoutClick={handleLogoutClick}
          />
        </>
      ) : (
        <>
          <Button
            component={RouterLink}
            to="/login"
            startIcon={<Login />}
            sx={navButtonStyle}
          >
            Login
          </Button>
          {/* <Button
            component={RouterLink}
            to="/register"
            startIcon={<PersonAdd />}
            sx={{
              ...navButtonStyle,
              background: "rgba(255,255,255,0.2)",
              "&:hover": {
                background: "rgba(255,255,255,0.3)",
                transform: "translateY(-2px)",
              },
            }}
          >
            Register
          </Button> */}
        </>
      )}
    </Box>
  );
};

export default DesktopNav;
