// components/ImageOptimizationSettings.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  TextField,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import {
  Image,
  Storage,
  Speed,
  HighQuality,
} from '@mui/icons-material';

const ImageOptimizationSettings = ({ settings, onChange }) => {
  const [localSettings, setLocalSettings] = useState({
    enabled: true,
    maxSizeMB: 2,
    maxWidth: 1920,
    quality: 85,
    preserveMetadata: false,
    ...settings
  });

  const handleChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    if (onChange) onChange(newSettings);
  };

  const estimatedSize = (originalSizeMB) => {
    if (!localSettings.enabled) return originalSizeMB;
    const qualityFactor = localSettings.quality / 100;
    return Math.min(
      localSettings.maxSizeMB,
      originalSizeMB * qualityFactor * 0.5 // Rough estimation
    );
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Image /> Image Optimization Settings
      </Typography>
      
      <FormControlLabel
        control={
          <Switch
            checked={localSettings.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
          />
        }
        label="Enable image optimization"
        sx={{ mb: 2 }}
      />
      
      {localSettings.enabled && (
        <Box sx={{ mt: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Storage /> Maximum File Size
              </Typography>
              <Slider
                value={localSettings.maxSizeMB}
                onChange={(e, value) => handleChange('maxSizeMB', value)}
                min={0.5}
                max={5}
                step={0.1}
                marks={[
                  { value: 0.5, label: '0.5MB' },
                  { value: 2, label: '2MB' },
                  { value: 5, label: '5MB' }
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}MB`}
              />
              <Typography variant="caption" color="text.secondary">
                Target maximum size after optimization
              </Typography>
            </Box>
            
            <Box>
              <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed /> Maximum Width
              </Typography>
              <Slider
                value={localSettings.maxWidth}
                onChange={(e, value) => handleChange('maxWidth', value)}
                min={800}
                max={3840}
                step={100}
                marks={[
                  { value: 800, label: '800px' },
                  { value: 1920, label: '1920px' },
                  { value: 3840, label: '4K' }
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}px`}
              />
              <Typography variant="caption" color="text.secondary">
                Images will be resized to fit within this width
              </Typography>
            </Box>
            
            <Box>
              <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HighQuality /> Quality
              </Typography>
              <Slider
                value={localSettings.quality}
                onChange={(e, value) => handleChange('quality', value)}
                min={50}
                max={100}
                step={5}
                marks={[
                  { value: 50, label: 'Low' },
                  { value: 75, label: 'Medium' },
                  { value: 90, label: 'High' },
                  { value: 100, label: 'Best' }
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
              />
              <Typography variant="caption" color="text.secondary">
                Balance between quality and file size
              </Typography>
            </Box>
            
            <Divider />
            
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Estimation:</strong> A 15MB image will be optimized to approximately{' '}
                <strong>{estimatedSize(15).toFixed(1)}MB</strong> with current settings.
              </Typography>
            </Alert>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default ImageOptimizationSettings;