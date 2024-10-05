'use client'
import { Box, Button, Typography } from "@mui/material";
import { useUser } from '@auth0/nextjs-auth0/client';
import Image from "next/image";



export default function Home() {
  const {user, error, isLoading} = useUser();

  if (isLoading) {
    return <Typography>Loading...</Typography>; // Show a loading message while checking authentication
  }

  if (!user) {
    window.location.href = '/api/auth/login';
  }

  return (
    <Box>
      <Typography variant="h2" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
                    Text
      </Typography>
                  <Box display="flex" justifyContent="center">
                  <Button color="inherit" href="/api/auth/logout">
            logout
          </Button>
                  <Button 
                    href="/api/auth/login" 
                    variant="contained" 
                  
                  >
                    login
                  </Button>
                  </Box>
    </Box>
  )
}
