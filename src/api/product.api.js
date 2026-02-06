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
    priceRange: res.data.priceRange,
  };
};

export const updateProductAPI = async (productId, productData) => {
  const res = await axiosClient.put(`/products/${productId}`, productData);
  return res.data;
};

export const updateVariantAPI = async (variantId, variantData) => {
  const res = await axiosClient.put(`/variants/${variantId}`, variantData);
  return res.data;
};

export const uploadImageAPI = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const res = await axiosClient.post("/upload/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
// Bulk update product and variants
export const bulkUpdateProductWithVariantsAPI = async (productId, data) => {
  const response = await axios.put(`/api/products/${productId}/bulk-update`, data);
  return response.data;
};