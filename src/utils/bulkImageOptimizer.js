// utils/bulkImageOptimizer.js
export const optimizeProductImages = async (productImages, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    quality: 0.8,
    batchSize: 5 // Process 5 images at a time
  };

  const optimizedImages = [];
  const errors = [];

  // Process in batches to avoid memory issues
  for (let i = 0; i < productImages.length; i += defaultOptions.batchSize) {
    const batch = productImages.slice(i, i + defaultOptions.batchSize);
    
    const batchPromises = batch.map(async (image) => {
      try {
        const optimized = await optimizeImage(image.file, defaultOptions);
        return {
          ...image,
          file: optimized,
          originalSize: image.file.size,
          optimizedSize: optimized.size,
          reduction: ((1 - optimized.size / image.file.size) * 100).toFixed(1)
        };
      } catch (error) {
        errors.push({ image: image.name, error: error.message });
        return null;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    optimizedImages.push(...batchResults.filter(Boolean));
  }

  const totalReduction = optimizedImages.reduce((sum, img) => {
    return sum + (1 - img.optimizedSize / img.originalSize);
  }, 0) / optimizedImages.length * 100;

  return {
    success: errors.length === 0,
    optimizedImages,
    errors,
    stats: {
      total: productImages.length,
      successful: optimizedImages.length,
      failed: errors.length,
      averageReduction: totalReduction.toFixed(1) + '%'
    }
  };
};