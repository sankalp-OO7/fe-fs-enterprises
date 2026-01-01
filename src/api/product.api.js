import axiosClient from "./axiosClient";

export const fetchProducts = async () => {
  const res = await axiosClient.get("/products");
  return res.data.data;
};

export const fetchCategories = async () => {
  const res = await axiosClient.get("/categories");
  return res.data.data;
};

export const fetchProductWithVariants = async (productId) => {
  const res = await axiosClient.get(`/products/${productId}/variants`);
  return {
    productDetails: res.data.product,
    variants: res.data.data,
  };
};
