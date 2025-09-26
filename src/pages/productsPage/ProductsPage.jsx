// src/ProductView/MainPage.jsx

import React, { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import CategoryPage from "./CategoryPage";
import ProductView from "./ProductView";
import ProductManagement from "./ProductManagement";
import AddProduct from "./AddProduct";

const ProductPage = () => {
  const [activePage, setActivePage] = useState("products"); // default

  const renderPage = () => {
    switch (activePage) {
      case "category":
        return <CategoryPage />;
      case "products":
        return <ProductView />;
      case "management":
        return <ProductManagement />;
      case "addProduct":
        return <AddProduct />;
      default:
        return <ProductView />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Buttons Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <Button
          variant={activePage === "category" ? "contained" : "outlined"}
          onClick={() => setActivePage("category")}
        >
          Category Page
        </Button>

        <Button
          variant={activePage === "products" ? "contained" : "outlined"}
          onClick={() => setActivePage("products")}
        >
          Products Page
        </Button>

        <Button
          variant={activePage === "management" ? "contained" : "outlined"}
          onClick={() => setActivePage("management")}
        >
          Product Management
        </Button>

        <Button
          variant={activePage === "addProduct" ? "contained" : "outlined"}
          onClick={() => setActivePage("addProduct")}
        >
          + Add Product{" "}
        </Button>
      </Box>

      {/* Render Selected Page */}
      <Box>{renderPage()}</Box>
    </Container>
  );
};

export default ProductPage;
