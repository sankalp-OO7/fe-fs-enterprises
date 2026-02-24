import axiosClient from "./axiosClient";
import { uploadClient } from "./axiosClient";
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



export const uploadImageDirectAPI = async (formData) => {
  try {
    
    // Use the dedicated upload client
    const response = await uploadClient.post('/upload/upload-direct', formData);
    return response.data;
    
  } catch (error) {
    console.error('Direct upload API error:', error);
    
    // Provide more detailed error message
    if (error.response) {
      // The request was made and the server responded with a status code
      throw new Error(`Upload failed: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('Upload failed: No response from server');
    } else {
      // Something happened in setting up the request
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
};

// Keep other functions as they are...

// Bulk update product and variants
export const bulkUpdateProductWithVariantsAPI = async (productId, data) => {
  try {

    
    // Clean up variant data before sending
    const cleanedData = { ...data };
    
    if (cleanedData.variants) {
      cleanedData.variants = cleanedData.variants.map(variant => {
        const { id, isNew, hasCustomImage, ...rest } = variant;
        
        // Only include _id if it's a valid MongoDB ObjectId (24 hex chars)
        const isValidObjectId = id && /^[0-9a-fA-F]{24}$/.test(id);
        
        return {
          ...rest,
          // Only send _id for existing variants with valid ObjectId
          ...(isValidObjectId ? { _id: id } : {})
        };
      });
    }
    
    
    const response = await axiosClient.put(`/products/${productId}/bulk-update`, cleanedData, {
      timeout: 30000,
    });
    
    return response.data;
    
  } catch (error) {
    console.error('Bulk update API error:', error);
    
    let errorMessage = 'Bulk update failed';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
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