'use client'
import { Box, Button, Typography } from "@mui/material";
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from "next/image";
import CustomButton from './CustomButton';
import React from "react";
import './gradient.css';
import './circles.css';
import { HideImageRounded } from "@mui/icons-material";




export default function Home() {
  const { user, error, isLoading } = useUser();

  const handleClick = () => {
    // Add your click handling logic here
    console.log("Button clicked!");

// ... existing code ...
// Wait for 5 seconds before redirecting
setTimeout(() => {
  window.location.href = '/interface';
}, 1000); // 1000 milliseconds = 1 seconds
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>; // Show a loading message while checking authentication
  }

  if (!user) {
    window.location.href = '/api/auth/login';
  }

  return (
    // className="gradient"
    // each li represents a ring
    
    <Box height='100%' sx={{ backgroundColor: 'rgba(226, 177, 69, .30)' }}>
      <ul class='ring'>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>

      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ height: '100vh' }}>
      <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 1)', padding: 0, borderRadius: '50%', overflow: 'HideImageRounded'} } > {/* Added solid background */}
              {/* <Image
                src="/images/venta.png" // Replace with your image path
                alt="Venta logo" // Replace with your image description
                width={150} // Set the desired width
                height={150} // Set the desired height
              /> */}
            </Box>
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ gap: 1 }}>
          {/* <Button color="inherit" href="/api/auth/logout">
            Logout
          </Button> */}

          <CustomButton
            id="transitionButton"  
            label="Vent" 
            onClick={handleClick} 
          />
        </Box>
      </Box>


    </Box>
  );
}