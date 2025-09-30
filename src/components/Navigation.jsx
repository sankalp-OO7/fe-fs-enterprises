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
  DialogActions,
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

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const {
    cart,
    cartOpen,
    snackbarOpen,
    snackbarMessage,
    getTotalCartItems,
    getTotalCartValue,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    openCart,
    closeCart,
    closeSnackbar,
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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hardware Shop
          </Typography>
          <Box>
            {user ? (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/products"
                  sx={{
                    "&:hover": {
                      backgroundColor: "primary.dark",
                      color: "white",
                    },
                  }}
                >
                  Products
                </Button>
                {isAdmin() && (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/users"
                    sx={{
                      "&:hover": {
                        backgroundColor: "primary.dark",
                        color: "white",
                      },
                    }}
                  >
                    Users
                  </Button>
                )}
                {isAdmin() && (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/adminOrders"
                    sx={{
                      "&:hover": {
                        backgroundColor: "primary.dark",
                        color: "white",
                      },
                    }}
                  >
                    Orders  
                  </Button>
                )}
                {/* Cart Icon Button with Badge */}
                <IconButton
                  color="inherit"
                  onClick={openCart}
                  size="large"
                  aria-label="open cart"
                >
                  <Badge
                    badgeContent={getTotalCartItems()}
                    color="error"
                    invisible={getTotalCartItems() === 0}
                  >
                    <ShoppingCartIcon />
                  </Badge>
                </IconButton>
                <Button color="inherit" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/register">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {/* Cart Dialog */}
      <Dialog
        open={cartOpen}
        onClose={closeCart}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", maxHeight: "80vh" } }}
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
            <IconButton onClick={closeCart}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {cart.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <ShoppingCartIcon
                sx={{ fontSize: "4rem", color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Add some products to get started!
              </Typography>
            </Box>
          ) : (
            <>
              <List sx={{ maxHeight: 400, overflowY: "auto", pt: 0, pb: 0 }}>
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
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <RemoveIcon />
                        </MuiIconButton>
                        <Typography
                          sx={{
                            minWidth: 30,
                            textAlign: "center",
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity}
                        </Typography>
                        <MuiIconButton
                          size="small"
                          onClick={() =>
                            updateCartItemQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <AddIcon />
                        </MuiIconButton>
                        <MuiIconButton
                          size="small"
                          color="error"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <DeleteIcon />
                        </MuiIconButton>
                      </Stack>
                    </ListItem>
                    {index < cart.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Box
                sx={{
                  p: 3,
                  bgcolor: "background.paper",
                  borderTop: "1px solid rgba(0,0,0,0.12)",
                }}
              >
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
                    sx={{
                      borderRadius: "15px",
                      py: 1.5,
                      background: "linear-gradient(45deg, #4CAF50, #8BC34A)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #45a049, #7CB342)",
                      },
                      fontWeight: 600,
                      fontSize: "1.1rem",
                    }}
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
    </>
  );
};

export default Navigation;
