import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Alert, Paper } from '@mui/material';
import { registerSuccess, setError } from '../features/auth/authSlice';
import { registerUser } from '../features/auth/authService';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      registerUser(form);
      dispatch(registerSuccess());
      navigate('/login');
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
            Register
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField label="Full Name" name="name" value={form.name} onChange={handleChange} required fullWidth />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
            <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required fullWidth />
            <Button type="submit" variant="contained" fullWidth>Register</Button>
            <Typography variant="body2" textAlign="center">
              Already have an account? <Link to="/login">Login</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
