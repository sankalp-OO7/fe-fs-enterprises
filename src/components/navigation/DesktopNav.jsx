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
}) => {
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
            // <IconButton
            //   onClick={openCart}
            //   sx={{
            //     color: "white",
            //     transition: "all 0.3s ease",
            //     "&:hover": {
            //       backgroundColor: "rgba(255,255,255,0.15)",
            //       transform: "scale(1.1)",
            //     },
            //   }}
            // >
            //   <Badge
            //     badgeContent={getTotalCartItems()}
            //     color="error"
            //     sx={{
            //       "& .MuiBadge-badge": {
            //         fontWeight: 700,
            //         fontSize: "0.7rem",
            //         minWidth: 18,
            //         height: 18,
            //         border: "2px solid white",
            //         boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            //       },
            //     }}
            //   >
            //     Memo Management
            //     {/* <ShoppingCart /> */}
            //   </Badge>
            // </IconButton>
                        <Button
              // component={RouterLink}
              // to="/users"
              onClick={openCart}
              startIcon={<ListAlt />}
              sx={navButtonStyle}
            >
              Memo
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
