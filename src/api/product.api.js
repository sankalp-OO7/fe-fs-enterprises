import axiosClient from "./axiosClient";

export const fetchProducts = async () => {
  const res = await axiosClient.get("/products");
  return res.data.data;
};

export const createProductAPI = async (productData) => {
  const res = await axiosClient.post("/products", productData);
  return res.data;
};
export const fetchProductWithVariants = async (productId) => {
  const res = await axiosClient.get(`/products/${productId}/variants`);
  console.log("Product with variants API response:", res.data);
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

// Base64 upload (legacy - keep for compatibility)
export const uploadImageAPI = async (payload) => {
  try {
    console.log('Base64 upload API called');
    
    const response = await fetch('/api/upload/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Base64 upload API error:', error);
    throw error;
  }
};

// Direct file upload (recommended)
export const uploadImageDirectAPI = async (formData) => {
  try {
    console.log('Direct file upload API called');
    
    // Try with axios first (if configured for file uploads)
    try {
      const response = await axiosClient.post('/upload/upload-direct', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });
      return response.data;
    } catch (axiosError) {
      console.log('Axios upload failed, trying fetch fallback:', axiosError.message);
      
      // Fallback to fetch
      const response = await fetch('/api/upload/upload-direct', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return await response.json();
    }
  } catch (error) {
    console.error('Direct upload API error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Bulk update product and variants
export const bulkUpdateProductWithVariantsAPI = async (productId, data) => {
  try {
    const response = await axiosClient.put(`/products/${productId}/bulk-update`, data);
    return response.data;
  } catch (error) {
    console.error('Bulk update API error:', error);
    throw error;
  }
};



// ===================== CATEGORY APIs =====================

/**
 * Fetch all categories
 */
export const fetchCategories = async (params = {}) => {
  try {
    const res = await axiosClient.get("/categories", { params });
    return res.data.data;
  } catch (error) {
    console.error("Fetch categories error:", error);
    throw error;
  }
};

/**
 * Fetch single category by ID
 */
export const fetchCategoryById = async (categoryId) => {
  try {
    const res = await axiosClient.get(`/categories/${categoryId}`);
    return res.data.data;
  } catch (error) {
    console.error("Fetch category by ID error:", error);
    throw error;
  }
};

/**
 * Create new category
 */
export const createCategoryAPI = async (categoryData) => {
  try {
    const res = await axiosClient.post("/categories", categoryData);
    return res.data;
  } catch (error) {
    console.error("Create category error:", error);
    throw error;
  }
};

/**
 * Update category
 */
export const updateCategoryAPI = async (categoryId, categoryData) => {
  try {
    const res = await axiosClient.put(`/categories/${categoryId}`, categoryData);
    return res.data;
  } catch (error) {
    console.error("Update category error:", error);
    throw error;
  }
};

/**
 * Delete category
 */
export const deleteCategoryAPI = async (categoryId) => {
  try {
    const res = await axiosClient.delete(`/categories/${categoryId}`);
    return res.data;
  } catch (error) {
    console.error("Delete category error:", error);
    throw error;
  }
};

/**
 * Search categories
 */
export const searchCategoriesAPI = async (searchTerm) => {
  try {
    const res = await axiosClient.get("/categories", {
      params: { search: searchTerm }
    });
    return res.data.data;
  } catch (error) {
    console.error("Search categories error:", error);
    throw error;
  }
};