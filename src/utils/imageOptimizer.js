import imageCompression from 'browser-image-compression';

/**
 * Optimize image before upload
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Optimized image file
 */
export const optimizeImage = async (file, options = {}) => {
  try {
    console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    
    const defaultOptions = {
      maxSizeMB: 1, // Maximum size in MB (adjust as needed)
      maxWidthOrHeight: 1920, // Maximum width/height in pixels
      useWebWorker: true, // Use web worker for better performance
      fileType: file.type, // Keep original file type
      initialQuality: 0.8, // Initial quality (0.8 = 80%)
      alwaysKeepResolution: true, // Keep aspect ratio
      ...options
    };

    // If image is already small, don't compress
    if (file.size <= defaultOptions.maxSizeMB * 1024 * 1024) {
      console.log('Image is already optimized, skipping compression');
      return file;
    }

    const compressedFile = await imageCompression(file, defaultOptions);
    
    console.log('Compressed file size:', 
      (compressedFile.size / 1024 / 1024).toFixed(2), 'MB',
      'Reduction:', 
      ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
    );
    
    return compressedFile;
  } catch (error) {
    console.error('Image optimization error:', error);
    // Return original file if optimization fails
    return file;
  }
};

/**
 * Validate image file
 * @param {File} file - Image file
 * @param {Object} constraints - Validation constraints
 * @returns {Object} Validation result
 */
export const validateImage = (file, constraints = {}) => {
  const {
    maxSizeMB = 15,
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    minWidth = 100,
    minHeight = 100
  } = constraints;

  const errors = [];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }

  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`File too large. Maximum size: ${maxSizeMB}MB`);
  }

  // Check dimensions (optional, requires image loading)
  const checkDimensions = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width < minWidth || img.height < minHeight) {
        errors.push(`Image too small. Minimum: ${minWidth}x${minHeight}px`);
      }
      resolve(errors);
    };
    img.onerror = () => resolve(errors); // Skip dimension check if can't load
    img.src = URL.createObjectURL(file);
  });

  return {
    isValid: errors.length === 0,
    errors,
    checkDimensions
  };
};

/**
 * Convert File to Base64 with optimization
 * @param {File} file - Image file
 * @returns {Promise<string>} - Base64 string
 */
export const fileToOptimizedBase64 = async (file) => {
  try {
    // First optimize the image
    const optimizedFile = await optimizeImage(file, {
      maxSizeMB: 2, // Target 2MB after compression
      maxWidthOrHeight: 1600, // Good for web display
      initialQuality: 0.85 // Good balance of quality/size
    });

    // Convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(optimizedFile);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data URL prefix
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error('Base64 conversion error:', error);
    throw error;
  }
};

/**
 * Get image dimensions
 * @param {File} file - Image file
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src); // Clean up
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};