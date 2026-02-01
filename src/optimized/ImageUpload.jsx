// src/components/optimized/ImageUpload.jsx
import React, { memo, useState, useRef } from 'react';
import { Avatar, Button, Box, CircularProgress, IconButton } from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImageUpload = memo(({ src, alt, onUpload, onRemove, size = 200 }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Avatar
        src={src}
        alt={alt}
        variant="rounded"
        sx={{
          width: size,
          height: size,
          mx: 'auto',
          mb: 2,
          border: '2px dashed',
          borderColor: 'primary.main',
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
        }}
        onClick={() => fileInputRef.current?.click()}
      />
      
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button
          component="label"
          variant="contained"
          startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          disabled={uploading}
          size="small"
        >
          Upload
          <VisuallyHiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
          />
        </Button>
        
        {src && (
          <IconButton onClick={onRemove} size="small" color="error">
            <Delete />
          </IconButton>
        )}
      </Box>
    </Box>
  );
});

export default ImageUpload;