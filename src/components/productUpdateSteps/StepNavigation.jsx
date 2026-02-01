// src/pages/components/StepNavigation.jsx
import React from 'react';
import { Paper, Button, Box } from '@mui/material';
import { Category, Inventory2, CheckCircle } from '@mui/icons-material';

const StepNavigation = React.memo(({ activeStep, steps, variantsCount, onStepChange }) => {
  const buttons = [
    { label: 'Product Details', icon: <Category />, step: 0 },
    { label: `Variants (${variantsCount})`, icon: <Inventory2 />, step: 1 },
    { label: 'Review & Save', icon: <CheckCircle />, step: 2 },
  ];

  return (
    <Paper sx={{ p: 2, mb: 4, borderRadius: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
      {buttons.map(({ label, icon, step }) => (
        <Button
          key={step}
          variant={activeStep === step ? 'contained' : 'outlined'}
          onClick={() => onStepChange(step)}
          startIcon={icon}
          disabled={step === 1 && variantsCount === 0}
          sx={{ flex: 1, maxWidth: 200 }}
        >
          {label}
        </Button>
      ))}
    </Paper>
  );
});

export default StepNavigation;