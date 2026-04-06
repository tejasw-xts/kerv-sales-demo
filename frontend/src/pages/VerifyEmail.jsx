import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { updateUserSuccess } from '../features/auth/authSlice';
import { verifyEmailToken } from '../features/auth/authService';

export default function VerifyEmail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  useEffect(() => {
    let ignore = false;

    const runVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('This verification link is invalid or missing.');
        return;
      }

      setStatus('loading');

      try {
        const response = await verifyEmailToken(token);

        if (ignore) {
          return;
        }

        if (user?.email && user.email === response.user.email) {
          dispatch(updateUserSuccess(response.user));
        }

        setStatus('success');
        setMessage(response.message);
      } catch (error) {
        if (ignore) {
          return;
        }

        setStatus('error');
        setMessage(error.message);
      }
    };

    runVerification();

    return () => {
      ignore = true;
    };
  }, [dispatch, token, user?.email]);

  return (
    <AuthShell
      eyebrow="Email Verification"
      title="Verify your email"
      subtitle="We are confirming your KERV Sales Demo email address."
      formTitle="Verification Status"
      footer={
        <Typography variant="body2">
          Return to{' '}
          <Link to="/login" className="auth-link">
            login
          </Link>
        </Typography>
      }
    >
      <Stack spacing={2} className="auth-form">
        {status === 'loading' ? <Alert severity="info">Verifying your email...</Alert> : null}
        {status === 'success' ? <Alert severity="success">{message}</Alert> : null}
        {status === 'error' ? <Alert severity="error">{message}</Alert> : null}

        <Button
          variant="contained"
          onClick={() => navigate(user ? '/dashboard' : '/login', { replace: true })}
          disabled={status === 'loading'}
        >
          {user ? 'GO TO DASHBOARD' : 'BACK TO LOGIN'}
        </Button>
      </Stack>
    </AuthShell>
  );
}
