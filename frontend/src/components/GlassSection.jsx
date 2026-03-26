import React from 'react';
import { Box } from '@mui/material';

export default function GlassSection({ children, className = '', ...props }) {
  const combinedClassName = className ? `glass-section ${className}` : 'glass-section';

  return (
    <Box className={combinedClassName} {...props}>
      {children}
    </Box>
  );
}
