import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import AuthShell from '../components/AuthShell';
import { clearError, registerSuccess, setError } from '../features/auth/authSlice';
import { registerUser } from '../features/auth/authService';

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
    <AuthShell
      eyebrow="New Sales User"
      title="Create your KERV access"
      subtitle="Set up a demo account so you can store configurations, return to saved environments, and share secure walkthroughs with prospects."
      formTitle="Register"
      footer={
        <Typography variant="body2">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in instead
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit} className="auth-form" noValidate>
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
        />

        <Button type="submit" variant="contained" fullWidth>
          CREATE ACCOUNT
        </Button>
      </Stack>
    </AuthShell>
  );
}
