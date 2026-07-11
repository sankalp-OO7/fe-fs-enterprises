// src/hooks/useProductValidation.js
import { useState, useEffect, useMemo } from 'react';

export const useProductValidation = (productData, variants, deletedVariants) => {
  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [validationKey, setValidationKey] = useState(0);

  // Force re-validation when variants change
  useEffect(() => {
    setValidationKey(prev => prev + 1);
  }, [variants]);

  const validate = useMemo(() => {
    const validationErrors = [];

    // Check for duplicate variant names (case-insensitive)
    const nameMap = new Map();
    const duplicateNames = [];

    variants.forEach((variant, index) => {
      const name = variant.variantName?.trim();
      if (name) {
        const key = name.toLowerCase();
        if (nameMap.has(key)) {
          const existingName = variants[nameMap.get(key)].variantName;
          if (!duplicateNames.includes(name) && !duplicateNames.includes(existingName)) {
            duplicateNames.push(name);
            duplicateNames.push(existingName);
          }
        } else {
          nameMap.set(key, index);
        }
      }
    });

    if (duplicateNames.length > 0) {
      validationErrors.push({
        type: 'duplicate_name',
        severity: 'error',
        message: `Duplicate variant names: ${[...new Set(duplicateNames)].join(', ')}`,
        field: 'variantName'
      });
    }

    // Check for empty variant names
    const emptyNames = variants
      .map((v, index) => ({ name: v.variantName, index }))
      .filter(v => !v.name || v.name.trim() === '');

    if (emptyNames.length > 0) {
      validationErrors.push({
        type: 'empty_name',
        severity: 'error',
        message: `Variant ${emptyNames.map(v => `#${v.index + 1}`).join(', ')} has no name`,
        field: 'variantName'
      });
    }

    // Check for invalid prices
    const invalidPrices = variants
      .map((v, index) => ({ 
        index, 
        invoicePrice: v.invoicePrice, 
        estimatePrice: v.estimatePrice,
        name: v.variantName || `Variant #${index + 1}`
      }))
      .filter(v => 
        v.invoicePrice === undefined || 
        v.invoicePrice === null || 
        v.invoicePrice === '' ||
        isNaN(Number(v.invoicePrice)) ||
        Number(v.invoicePrice) < 0 ||
        v.estimatePrice === undefined ||
        v.estimatePrice === null ||
        v.estimatePrice === '' ||
        isNaN(Number(v.estimatePrice)) ||
        Number(v.estimatePrice) < 0
      );

    if (invalidPrices.length > 0) {
      validationErrors.push({
        type: 'invalid_price',
        severity: 'error',
        message: `Invalid prices for: ${invalidPrices.map(v => v.name).join(', ')}`,
        field: 'price'
      });
    }

    // Check for product name
    if (!productData?.productName?.trim()) {
      validationErrors.push({
        type: 'product_name',
        severity: 'error',
        message: 'Product name is required',
        field: 'productName'
      });
    }

    return validationErrors;
  }, [productData, variants, validationKey]);

  useEffect(() => {
    const errorOnly = validate.filter(err => err.severity === 'error');
    setErrors(validate);
    setIsValid(errorOnly.length === 0);
  }, [validate]);

  return { 
    errors, 
    isValid, 
    errorCount: errors.filter(e => e.severity === 'error').length,
    warningCount: errors.filter(e => e.severity === 'warning').length
  };
};