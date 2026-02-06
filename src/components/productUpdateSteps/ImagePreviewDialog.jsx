// src/pages/components/dialogs/ImagePreviewDialog.jsx
import React, { memo } from 'react';
import { Box, Typography } from '@mui/material';

const ImagePreviewDialog = memo(({ open, imageUrl, onClose }) => {
  if (!open) return null;

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300,
    }} onClick={onClose}>
      <Box sx={{ maxWidth: '90%', maxHeight: '90%', textAlign: 'center' }}>
        <img
          src={imageUrl}
          alt="Preview"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '90vh', 
            objectFit: 'contain',
            borderRadius: '8px'
          }}
        />
        <Typography variant="caption" color="white" sx={{ mt: 1, display: 'block' }}>
          Click anywhere to close
        </Typography>
      </Box>
    </Box>
  );
});

export default ImagePreviewDialog;