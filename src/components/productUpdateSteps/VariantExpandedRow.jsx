// src/pages/components/VariantExpandedRow.jsx
import React, { memo } from 'react';
import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Button,
  Grid,
  Collapse,
} from '@mui/material';
import { Edit } from '@mui/icons-material';

const VariantExpandedRow = memo(({ variant, isExpanded, onEdit }) => {
  return (
    <TableRow>
      <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Additional Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  UOM
                </Typography>
                <Typography variant="body2">
                  {variant.uom || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Default UOM
                </Typography>
                <Typography variant="body2">
                  {variant.defUom || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  HSN Code
                </Typography>
                <Typography variant="body2">
                  {variant.hsnCode || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  GST %
                </Typography>
                <Typography variant="body2">
                  {variant.gst || 0}%
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Purchase Rate
                </Typography>
                <Typography variant="body2">
                  ₹{variant.purRate?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Invoice Rate
                </Typography>
                <Typography variant="body2">
                  ₹{variant.invoiceRate?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Cash Memo Rate
                </Typography>
                <Typography variant="body2">
                  ₹{variant.cashMemoRate?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Estimate Rate
                </Typography>
                <Typography variant="body2">
                  ₹{variant.estimateRate?.toFixed(2) || '0.00'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Item Discount
                </Typography>
                <Typography variant="body2">
                  {variant.itemDisc || 'N/A'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Invoice Discount
                </Typography>
                <Typography variant="body2">
                  {variant.invDisc || 0}%
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Cash Memo Discount
                </Typography>
                <Typography variant="body2">
                  {variant.cashMemoDisc || 0}%
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  AG Discount
                </Typography>
                <Typography variant="body2">
                  {variant.agDisc || 0}%
                </Typography>
              </Grid>
            </Grid>
            
            <Button
              size="small"
              onClick={onEdit}
              startIcon={<Edit />}
              sx={{ mt: 2 }}
            >
              Edit All Fields
            </Button>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
});

export default VariantExpandedRow;