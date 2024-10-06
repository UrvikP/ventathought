import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const DynamicRing = ({ size = 40, thickness = 4, rgbColor = 'rgb(0, 0, 255)', value = 100 }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        sx={{
          color: rgbColor,  // Use the custom RGB color here
        }}
      />
    </Box>
  );
};

export default DynamicRing;