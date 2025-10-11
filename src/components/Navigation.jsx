import React from "react";
import useAuth from "../context/useAuth";
import { useCart } from "../context/CartContext";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton as MuiIconButton,
  Typography as MuiTypography,
  Button as MuiButton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axiosClient from "../api/axiosClient";

const GRADIENT = "linear-gradient(45deg, #4CAF50, #8BC34A)";
const GRADIENT_HOVER = "linear-gradient(45deg, #45a049, #7CB342)";

const S = {
  navButton: {
    textTransform: "none",
    fontWeight: 600,
    borderRadius: 2,
    px: 2,
    "&:hover": {
      backgroundColor: "primary.dark",
      color: "white",
    },
    transition: (t) =>
      t.transitions.create(["background-color", "box-shadow"], {
        duration: t.transitions.duration.short,
      }),
  },
  cartBadge: {
    "& .MuiBadge-badge": {
      fontWeight: 700,
      transform: "scale(0.95)",
    },
  },
  dialogPaper: {
    borderRadius: 3,
    maxHeight: { xs: "90vh", sm: "80vh" },
  },
  emptyCartIcon: { fontSize: "4rem", color: "text.secondary", mb: 2 },
  list: {
    maxHeight: { xs: 360, sm: 400 },
    overflowY: "auto",
    pt: 0,
    pb: 0,
    "&::-webkit-scrollbar": { width: 8 },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,0.2)",
      borderRadius: 8,
    },
    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
  },
  qtyButton: {
    border: "1px solid",
    borderColor: "divider",
    "&:hover": { bgcolor: "action.hover" },
    transition: (t) =>
      t.transitions.create(["background-color", "border-color"], {
        duration: t.transitions.duration.shortest,
      }),
  },
  totalBar: {
    p: 3,
    bgcolor: "background.paper",
    borderTop: "1px solid rgba(0,0,0,0.12)",
  },
  checkoutBtn: {
    borderRadius: "15px",
    py: 1.5,
    background: GRADIENT,
    fontWeight: 600,
    fontSize: "1.1rem",
    transition: (t) =>
      t.transitions.create(["background", "transform"], {
        duration: t.transitions.duration.short,
      }),
    "&:hover": {
      background: GRADIENT_HOVER,
      transform: "translateY(-1px)",
    },
  },
  clearBtn: {
    textTransform: "none",
    fontWeight: 600,
  },
};

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

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

  const handleCheckout = () => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        if (cart.length === 0) {
          setError("Your cart is empty.");
          setLoading(false);
          return;
        }
        const orderPayload = {
          items: cart.map((item) => ({
            productId: item.product._id,
            variantId: item.variant._id,
            quantity: item.quantity,
            price: item.variant.price,
          })),
          totalAmount: cart.reduce(
            (sum, item) => sum + item.variant.price * item.quantity,
            0
          ),
          shippingAddress: "123 Demo St, Sample City, Country",
          paymentMethod: "Cash on Delivery",
          paymentStatus: "Paid",
        };
        const response = await axiosClient.post("/orders", orderPayload);
        if (response.status === 201) {
          alert("Order placed successfully!");
          clearCart();
          closeCart();
        } else {
          setError("Failed to place the order. Please try again.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred during checkout.");
      } finally {
        setLoading(false);
      }
    })();
  };

  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);

  const handleLogoutClick = () => setLogoutDialogOpen(true);
  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
  };
  const handleLogoutCancel = () => setLogoutDialogOpen(false);

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hardware Shop
          </Typography>

          <Box>
            {user ? (
              <>
                {isAdmin() && (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/adminOrders"
                    sx={S.navButton}
                  >
                    Orders List
                  </Button>
                )}

                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/products"
                  sx={S.navButton}
                >
                  Products
                </Button>

                {isAdmin() && (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/users"
                    sx={S.navButton}
                  >
                    Users
                  </Button>
                )}
                {!isAdmin() && (
                  <IconButton
                    color="inherit"
                    onClick={openCart}
                    size="large"
                    aria-label="open cart"
                    sx={{ ml: 0.5 }}
                  >
                    <Badge
                      badgeContent={getTotalCartItems()}
                      color="error"
                      overlap="circular"
                      anchorOrigin={{ vertical: "top", horizontal: "right" }}
                      invisible={getTotalCartItems() === 0}
                      sx={{
                        "& .MuiBadge-badge": {
                          minWidth: 15,
                          height: 15,
                          px: 0.25,
                          fontSize: 9,
                          fontWeight: 700,
                          lineHeight: 1,
                          borderRadius: "50%",
                          border: "2px solid",
                          borderColor: "background.paper",
                          boxShadow: 1,
                          transform: "translate(4px, -4px)",
                        },
                      }}
                    >
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>
                )}
                <Button color="inherit" onClick={handleLogoutClick} sx={S.navButton}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                  sx={S.navButton}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/register"
                  sx={S.navButton}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog
        open={cartOpen}
        onClose={closeCart}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: S.dialogPaper }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <ShoppingCartIcon color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Shopping Cart ({getTotalCartItems()} items)
              </Typography>
            </Stack>
            <IconButton onClick={closeCart} aria-label="close cart">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {cart.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <ShoppingCartIcon sx={S.emptyCartIcon} />
              <Typography variant="h6" color="text.secondary">
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add some products to get started!
              </Typography>
            </Box>
          ) : (
            <>
              <List sx={S.list}>
                {cart.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar
                          src={item.variant.imageUrl}
                          alt={item.product.name}
                          sx={{ width: 60, height: 60, borderRadius: "12px" }}
                        />
                      </ListItemAvatar>

                      <ListItemText
                        primary={
                          <MuiTypography variant="h6" sx={{ fontWeight: 600 }}>
                            {item.product.name}
                          </MuiTypography>
                        }
                        secondary={
                          <Stack spacing={1}>
                            <MuiTypography
                              variant="body2"
                              color="text.secondary"
                            >
                              Variant: {item.variant.name}
                            </MuiTypography>
                            <MuiTypography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "primary.main" }}
                            >
                              ₹{item.variant.price.toFixed(2)} × {item.quantity}{" "}
                              = ₹
                              {(item.variant.price * item.quantity).toFixed(2)}
                            </MuiTypography>
                          </Stack>
                        }
                        sx={{ ml: 2 }}
                      />

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MuiIconButton
                          size="small"
                          sx={S.qtyButton}
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity - 1)
                          }
                          aria-label="decrease quantity"
                        >
                          <RemoveIcon fontSize="small" />
                        </MuiIconButton>

                        <Typography
                          sx={{
                            minWidth: 32,
                            textAlign: "center",
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity}
                        </Typography>

                        <MuiIconButton
                          size="small"
                          sx={S.qtyButton}
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="increase quantity"
                        >
                          <AddIcon fontSize="small" />
                        </MuiIconButton>

                        <MuiIconButton
                          size="small"
                          color="error"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="remove item"
                        >
                          <DeleteIcon fontSize="small" />
                        </MuiIconButton>
                      </Stack>
                    </ListItem>

                    {index < cart.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              <Box sx={S.totalBar}>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      Total: ₹{getTotalCartValue().toFixed(2)}
                    </Typography>

                    <MuiButton
                      variant="outlined"
                      color="error"
                      onClick={clearCart}
                      size="small"
                      sx={S.clearBtn}
                    >
                      Clear Cart
                    </MuiButton>
                  </Stack>

                  <MuiButton
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleCheckout}
                    disabled={loading}
                    sx={S.checkoutBtn}
                  >
                    {loading ? "Processing..." : "Proceed to Checkout"}
                  </MuiButton>
                </Stack>

                {error && (
                  <Typography color="error" sx={{ mt: 1, mb: 1 }}>
                    {error}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out?</Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button onClick={handleLogoutCancel} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleLogoutConfirm} color="error" variant="contained">
              Logout
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navigation;
