// src/ProductView/MainPage.jsx

import React, { useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import CategoryPage from "./CategoryPage";
import ProductView from "./ProductView";
import AddProduct from "./AddProduct";

const ProductPage = ({ adminOnlyy, isAuthenticated }) => {
  const [activePage, setActivePage] = useState("products"); // default

  const renderPage = () => {
    switch (activePage) {
      case "category":
        return <CategoryPage />;
      case "products":
        return (
          <ProductView isAdmin={adminOnlyy} isAuthenticated={isAuthenticated} />
        );
      case "addProduct":
        return <AddProduct />;
      default:
        return (
          <ProductView isAdmin={adminOnlyy} isAuthenticated={isAuthenticated} />
        );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: adminOnlyy ? 2 : 0 }}>
      {/* Buttons Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 4,
        }}
      >
        {adminOnlyy && (
          <>
            <Button
              variant={activePage === "category" ? "contained" : "outlined"}
              onClick={() => setActivePage("category")}
            >
              Category add and update 
            </Button>

            <Button
              variant={activePage === "products" ? "contained" : "outlined"}
              onClick={() => setActivePage("products")}
            >
              Products and Variants Page
            </Button>

            <Button
              variant={activePage === "addProduct" ? "contained" : "outlined"}
              onClick={() => setActivePage("addProduct")}
            >
              + Add Product{" "}
            </Button>
          </>
        )}
      </Box>
      {/* Render Selected Page */}
      <Box>{renderPage()}</Box>
    </Container>
  );
};

export default ProductPage;
