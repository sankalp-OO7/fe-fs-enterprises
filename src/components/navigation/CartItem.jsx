import React from "react";
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Stack,
  IconButton,
  Divider,
  Box,
} from "@mui/material";
import { Remove, Add, Delete } from "@mui/icons-material";

const CartItem = ({ item, updateQuantity, removeItem }) => {
  return (
    <>
      <ListItem
        sx={{
          py: 2.5,
          px: 3,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "grey.50",
          },
        }}
      >
        <ListItemAvatar>
          <Avatar
            src={item.variant.imageUrl}
            alt={item.product.name}
            variant="rounded"
            sx={{
              width: 70,
              height: 70,
              borderRadius: 2,
              boxShadow: 2,
            }}
          />
        </ListItemAvatar>

        <ListItemText
          primary={
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {item.product.name}
            </Typography>
          }
          secondary={
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Variant: <strong>{item.variant.name}</strong>
              </Typography>
              <Box>
                <Typography
                  component="span"
                  variant="body1"
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    fontSize: "1.05rem",
                  }}
                >
                  ₹{item.variant.price.toFixed(2)}
                </Typography>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {" "}
                  × {item.quantity} ={" "}
                </Typography>
                <Typography
                  component="span"
                  variant="body1"
                  sx={{ fontWeight: 700, color: "success.main" }}
                >
                  ₹{(item.variant.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          }
          sx={{ ml: 2, mr: 2 }}
        />

        <Stack direction="row" alignItems="center" spacing={1}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{
              border: "2px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 0.5,
            }}
          >
            <IconButton
              size="small"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              sx={{
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "error.lighter",
                  color: "error.main",
                },
              }}
            >
              <Remove fontSize="small" />
            </IconButton>

            <Typography
              sx={{
                minWidth: 32,
                textAlign: "center",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              {item.quantity}
            </Typography>

            <IconButton
              size="small"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              sx={{
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "success.lighter",
                  color: "success.main",
                },
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Stack>

          <IconButton
            size="small"
            color="error"
            onClick={() => removeItem(item.id)}
            sx={{
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "error.lighter",
                transform: "scale(1.1)",
              },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Stack>
      </ListItem>
      <Divider />
    </>
  );
};

export default CartItem;
