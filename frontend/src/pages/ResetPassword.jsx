import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { resetPassword } from '../features/auth/authService';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  useEffect(() => {
    setError('');
  }, [token]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('This reset link is invalid or missing.');
      return;
    }

    if (!form.password) {
      setError('New password is required.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSaving(true);

    try {
      const message = await resetPassword({ token, password: form.password });
      navigate('/login', {
        replace: true,
        state: {
          resetSuccessMessage: message,
        },
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Set a new password"
      subtitle="Use the password reset link to choose a new password for your KERV demo account."
      formTitle="Reset Password"
      footer={
        <Typography variant="body2">
          Remembered your password?{' '}
          <Link to="/login" className="auth-link">
            Back to login
          </Link>
        </Typography>
      }
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit} className="auth-form" noValidate>
        {!token ? <Alert severity="error">This reset link is invalid or missing.</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          placeholder="New Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          placeholder="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          fullWidth
        />

        <Button type="submit" variant="contained" fullWidth disabled={!token || isSaving}>
          {isSaving ? 'UPDATING...' : 'SET PASSWORD'}
        </Button>
      </Stack>
    </AuthShell>
  );
}
