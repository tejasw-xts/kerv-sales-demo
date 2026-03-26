import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import AuthShell from '../components/AuthShell';
import { clearError, loginSuccess, setError } from '../features/auth/authSlice';
import { loginUser } from '../features/auth/authService';
import kervLogoIcon from '../assets/kerv-logo-icon.png';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, isAuthenticated } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.registeredEmail) {
      setForm((current) => ({ ...current, email: location.state.registeredEmail }));
    }
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      const user = await loginUser(form.email, form.password);
      dispatch(loginSuccess(user));
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  return (
    <AuthShell
      logoImage={{ src: kervLogoIcon, alt: 'KERV logo icon' }}
      brandName="Sales Demo Tool"
      separateBrandName
      showHeroBranding={false}
      solidBrandPanel
      title={
        <>
          Welcome back!
          <br />
          Log in to your account.
        </>
      }
      formTitle="Log in"
      footer={
        <Typography variant="body2">
          Need access?{' '}
          <Link to="/register" className="auth-link">
            Register here
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit} className="auth-form" noValidate>
        {location.state?.registeredEmail ? (
          <Alert severity="success">Registration complete. You can log in with your new KERV demo account.</Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          placeholder="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          placeholder="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          fullWidth
        />

        <Button type="submit" variant="contained" fullWidth>
          LOG IN
        </Button>

        <Box className="auth-secondary-link">
          <Typography component="span">FORGOT YOUR PASSWORD?</Typography>
        </Box>
      </Stack>
    </AuthShell>
  );
}
