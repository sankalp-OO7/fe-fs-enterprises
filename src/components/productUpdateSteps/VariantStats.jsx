import React, { memo } from 'react';
import { Grid, Paper, Typography } from '@mui/material';

const VariantStats = memo(({ 
  totalVariants, 
  totalStock, 
  customImages, 
  totalValue 
}) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={6} sm={3}>
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.50', border: 1, borderColor: 'primary.100' }}>
          <Typography variant="h6" fontWeight="bold" color="primary.main">
            {totalVariants}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Variants
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'success.50', border: 1, borderColor: 'success.100' }}>
          <Typography variant="h6" fontWeight="bold" color="success.main">
            {totalStock}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Stock
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'info.50', border: 1, borderColor: 'info.100' }}>
          <Typography variant="h6" fontWeight="bold" color="info.main">
            {customImages}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Custom Images
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={6} sm={3}>
        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', border: 1, borderColor: 'warning.100' }}>
          <Typography variant="h6" fontWeight="bold" color="warning.main">
            ₹{totalValue.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Value
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
});

export default VariantStats;