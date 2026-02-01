// src/hooks/useProductUpdate.js
import { useState, useCallback, useMemo } from 'react';

export const useProductUpdate = (initialProductData, initialVariants) => {
  const [productData, setProductData] = useState(initialProductData);
  const [variants, setVariants] = useState(initialVariants);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  // Memoized calculations
  const totals = useMemo(() => {
    const totalStock = variants.reduce((sum, v) => sum + (v.stockQty || 0), 0);
    const totalValue = variants.reduce((sum, v) => sum + (v.stockQty * (v.variantPrice || 0)), 0);
    const customImages = variants.filter(v => v.hasCustomImage).length;
    return { totalStock, totalValue, customImages };
  }, [variants]);

  // Optimized handlers
  const updateProductData = useCallback((updates) => {
    setProductData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateVariants = useCallback((newVariants) => {
    setVariants(newVariants);
  }, []);

  const handleSelectVariant = useCallback((variantId) => {
    setSelectedVariants(prev => 
      prev.includes(variantId)
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  }, []);

  const handleSelectAllVariants = useCallback(() => {
    if (selectedVariants.length === variants.length) {
      setSelectedVariants([]);
    } else {
      setSelectedVariants(variants.map(v => v.id));
    }
  }, [variants, selectedVariants.length]);

  return {
    productData,
    variants,
    selectedVariants,
    activeStep,
    totals,
    setActiveStep,
    updateProductData,
    updateVariants,
    handleSelectVariant,
    handleSelectAllVariants,
    setSelectedVariants,
  };
};