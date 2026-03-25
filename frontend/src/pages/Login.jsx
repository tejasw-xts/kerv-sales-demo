import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography, Alert, Paper } from '@mui/material';
import { loginSuccess, setError } from '../features/auth/authSlice';
import { loginUser } from '../features/auth/authService';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const user = loginUser(form.email, form.password);
      dispatch(loginSuccess(user));
      navigate('/dashboard');
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
            Login
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
            <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} required fullWidth />
            <Button type="submit" variant="contained" fullWidth>Login</Button>
            <Typography variant="body2" textAlign="center">
              Don't have an account? <Link to="/register">Register</Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
