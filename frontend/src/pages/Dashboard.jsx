import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Container, Typography } from '@mui/material';
import { logout } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={2}>
        <Typography variant="h4">Welcome, {user?.name}!</Typography>
        <Typography variant="body1">You are logged in as {user?.email}</Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>Logout</Button>
      </Box>
    </Container>
  );
}
