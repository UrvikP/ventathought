'use client'
import { Box, Button, Typography } from "@mui/material";
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from "next/image";
import CustomButton from './CustomButton';
import React from "react";


export default function Home() {
  const { user, error, isLoading } = useUser();

  const handleClick = () => {
    // Add your click handling logic here
    console.log("Button clicked!");
    window.location.href = '/interface';
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>; // Show a loading message while checking authentication
  }

  if (!user) {
    window.location.href = '/api/auth/login';
  }

  return (
    <Box>

      <Box display="flex" justifyContent="center" alignItems="center" sx={{ gap: 2, height: '100vh' }}>
        <Button color="inherit" href="/api/auth/logout">
          Logout
        </Button>

        <CustomButton 
          label="Vent" 
          onClick={handleClick} 
        />

      </Box>
    </Box>
  );
}