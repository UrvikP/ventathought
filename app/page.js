'use client'
import { Box, Button, Typography } from "@mui/material";
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from "next/image";
import CustomButton from './CustomButton';
import React from "react";
import './gradient.css';
import './circles.css';




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
    <Box height='100%'>
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
      </ul>

      <Box display="flex" justifyContent="center" alignItems="center" sx={{ gap: 2, height: '100vh' }}>
        <Button color="inherit" href="/api/auth/logout">
          Logout
        </Button>

        <CustomButton
          id="transitionButton"  
          label="Vent" 
          onClick={handleClick} 
        />

      </Box>


    </Box>
  );
}