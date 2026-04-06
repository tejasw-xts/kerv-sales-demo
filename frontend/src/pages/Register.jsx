import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { clearError, registerSuccess, setError } from '../features/auth/authSlice';
import { registerUser } from '../features/auth/authService';
import '../styles/auth.css';
import kervLogo from '../assets/kerv-logo.svg';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors((current) => ({ ...current, [e.target.name]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validateForm()) {
      return;
    }

    try {
      await registerUser(form);
      dispatch(registerSuccess());
      navigate('/login', {
        replace: true,
        state: { registeredEmail: form.email },
      });
    } catch (err) {
      dispatch(setError(err.message));
    }
  };

  return (
    <Box className="prototype-login">
      <Box className="prototype-login__frame">
        <Box className="prototype-login__content">
          <Stack direction="row" alignItems="center" spacing={1.5} className="prototype-login__brand-row">
            <Box component="img" src={kervLogo} alt="Kerv logo" className="prototype-login__brand-logo" />
            <Typography component="div" className="prototype-login__brand-text">
              | Sales Demo Tool
            </Typography>
          </Stack>

          <Typography component="h1" className="prototype-login__headline">
            Welcome!
            <br />
            Create your account.
          </Typography>

          <Box className="prototype-login__form-wrap">
            <Typography className="prototype-login__form-title">Register</Typography>

            <Stack component="form" spacing={1.4} onSubmit={handleSubmit} className="prototype-login__form" noValidate>
              {error ? <Alert severity="error">{error}</Alert> : null}

              <TextField
                placeholder="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={Boolean(formErrors.name)}
                helperText={formErrors.name || ' '}
                required
                fullWidth
                size="small"
              />
              <TextField
                placeholder="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={Boolean(formErrors.email)}
                helperText={formErrors.email || ' '}
                required
                fullWidth
                size="small"
              />
              <TextField
                placeholder="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                error={Boolean(formErrors.password)}
                helperText={formErrors.password || ' '}
                required
                fullWidth
                size="small"
              />

              <Button type="submit" variant="contained" fullWidth className="prototype-login__submit">
                CREATE ACCOUNT
              </Button>

              <Typography variant="body2" className="prototype-login__footer">
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Log in instead
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Box className="prototype-login__accent" aria-hidden="true" />
      </Box>
    </Box>
  );
}
