import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, Box, Button, Dialog, Stack, TextField, Typography } from '@mui/material';
import '../styles/auth.css';
import { clearError, loginSuccess, setError } from '../features/auth/authSlice';
import { loginUser, requestPasswordReset } from '../features/auth/authService';
import kervLogo from '../assets/kerv-logo.svg';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, isAuthenticated } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [sendingResetLink, setSendingResetLink] = useState(false);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.registeredEmail) {
      setForm((current) => ({ ...current, email: location.state.registeredEmail }));
      setForgotPasswordEmail(location.state.registeredEmail);
    }
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', {
        replace: true,
        state: {
          openProfileOnEntry: true,
        },
      });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleForgotPasswordOpen = () => {
    setForgotPasswordError('');
    setForgotPasswordNotice('');
    setResetLink('');
    setForgotPasswordEmail(form.email);
    setForgotPasswordOpen(true);
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordError('');
    setForgotPasswordNotice('');
    setResetLink('');
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordNotice('');
    setResetLink('');

    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('Email is required.');
      return;
    }

    setSendingResetLink(true);

    try {
      const response = await requestPasswordReset(forgotPasswordEmail);
      if (response.emailSent) {
        setForgotPasswordNotice(response.message);
      } else {
        setForgotPasswordError(response.message);
      }
      setResetLink(response.resetLink);
    } catch (requestError) {
      setForgotPasswordError(requestError.message);
    } finally {
      setSendingResetLink(false);
    }
  };

  const handleCopyResetLink = async () => {
    if (!resetLink || !navigator?.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(resetLink);
    setForgotPasswordNotice('Reset link copied successfully.');
  };

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
            Welcome back!
            <br />
            Log in to your account.
          </Typography>

          <Box className="prototype-login__form-wrap">
            <Typography className="prototype-login__form-title">Log in</Typography>

            <Stack component="form" spacing={1.4} onSubmit={handleSubmit} className="prototype-login__form" noValidate>
              {location.state?.registeredEmail ? (
                <Alert severity="success">Registration complete. You can log in with your new KERV demo account.</Alert>
              ) : null}
              {location.state?.resetSuccessMessage ? <Alert severity="success">{location.state.resetSuccessMessage}</Alert> : null}
              {error ? <Alert severity="error">{error}</Alert> : null}

              <TextField
                placeholder="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
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
                required
                fullWidth
                size="small"
              />

              <Button type="submit" variant="contained" fullWidth className="prototype-login__submit">
                LOG IN
              </Button>

              <Button type="button" variant="text" className="prototype-login__forgot" onClick={handleForgotPasswordOpen}>
                FORGOT YOUR PASSWORD?
              </Button>

              <Box className="prototype-login__signup-row">
                <Typography variant="body2" className="prototype-login__signup-message">
                  Don&apos;t have an account?
                </Typography>

                <Button type="button" variant="text" className="prototype-login__register-link" onClick={() => navigate('/register')}>
                  REGISTER
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Box className="prototype-login__accent" aria-hidden="true" />
      </Box>

      <Dialog
        open={forgotPasswordOpen}
        onClose={handleForgotPasswordClose}
        maxWidth="xs"
        fullWidth
        classes={{ paper: 'prototype-login__forgot-dialog' }}
      >
        <Box className="prototype-login__forgot-dialog-content">
          <Typography className="prototype-login__forgot-dialog-title">Forgot password</Typography>
          <Typography className="prototype-login__forgot-dialog-text">
            Enter your email address and we will send a reset link. If SMTP is not configured yet, the generated link will appear here.
          </Typography>

          <Stack component="form" spacing={1.5} onSubmit={handleForgotPasswordSubmit}>
            {forgotPasswordError ? <Alert severity="error">{forgotPasswordError}</Alert> : null}
            {forgotPasswordNotice ? <Alert severity="success">{forgotPasswordNotice}</Alert> : null}

            <TextField
              placeholder="Email"
              type="email"
              value={forgotPasswordEmail}
              onChange={(event) => setForgotPasswordEmail(event.target.value)}
              fullWidth
              required
              size="small"
            />

              {resetLink ? (
                <TextField
                  label="Reset Link"
                  value={resetLink}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
              />
            ) : null}

            <Stack direction="row" spacing={1.25} className="prototype-login__forgot-dialog-actions">
              <Button type="button" variant="text" onClick={handleForgotPasswordClose}>
                Cancel
              </Button>
              {resetLink ? (
                <>
                  <Button type="button" variant="outlined" onClick={handleCopyResetLink}>
                    Copy Link
                  </Button>
                  <Button type="button" variant="contained" onClick={() => navigate(`/reset-password?token=${new URL(resetLink).searchParams.get('token')}`)}>
                    Open Reset Page
                  </Button>
                </>
              ) : (
                <Button type="submit" variant="contained" disabled={sendingResetLink}>
                  {sendingResetLink ? 'SENDING...' : 'SEND RESET LINK'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}
