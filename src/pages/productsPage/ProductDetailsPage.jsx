import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import {
  Container,
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const defaultImages = [
  "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660477/fs/Fs3_iros0a.jpg",
  "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660467/fs/Fs2_n5g4lm.webp",
  "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660468/fs/Fs4_wnnaxc.jpg",
  "https://res.cloudinary.com/ddwsobxhr/image/upload/v1765660467/fs/Fs1_atrhyk.webp",
];

const getDefaultImageForProduct = (productId) => {
  if (!productId) return defaultImages[0];

  const hash = Array.from(productId).reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const index = Math.abs(hash) % defaultImages.length;
  return defaultImages[index];
};

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosClient.get(`/products/${productId}`);
        setProduct(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const priceInfo = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) {
      return "Price not available";
    }

    const prices = product.variants.map((v) => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `₹${minPrice.toFixed(2)}`;
    }

    return `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`;
  }, [product]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="warning">Product not found.</Alert>
      </Container>
    );
  }

  const pickedImage = product.variants?.[0]?.imageUrl
    ? product.variants[0].imageUrl
    : getDefaultImageForProduct(product._id);

  const categoryName =
    product.categoryId?.name || product.categoryId?.label || "Uncategorized";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Product Details
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: 4,
            }}
          >
            <CardMedia
              component="img"
              image={pickedImage}
              alt={product.name}
              sx={{ height: 320, objectFit: "cover" }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              {product.name}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
              <Chip
                icon={<LocalOfferIcon sx={{ fontSize: 18 }} />}
                label={categoryName}
                color="primary"
                variant="outlined"
              />
              <Chip label={priceInfo} color="success" />
              <Chip
                label={`${product.variants?.length || 0} variant${
                  (product.variants?.length || 0) === 1 ? "" : "s"
                }`}
                variant="outlined"
              />
            </Stack>

            <Typography variant="body1" color="text.secondary">
              {product.description || "No description available."}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {product.variants && product.variants.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            All Variants
          </Typography>

          <Grid container spacing={3}>
            {product.variants.map((variant) => (
              <Grid key={variant._id} item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {variant.imageUrl && (
                    <CardMedia
                      component="img"
                      image={variant.imageUrl}
                      alt={variant.name}
                      sx={{ height: 180, objectFit: "cover" }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {variant.name}
                    </Typography>
                    {variant.sku && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        SKU: {variant.sku}
                      </Typography>
                    )}
                    <Typography variant="body1" fontWeight={700} gutterBottom>
                      ₹{variant.price?.toFixed(2) || "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {variant.description || "No description available."}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Stock: {variant.stockQty ?? 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetailsPage;


