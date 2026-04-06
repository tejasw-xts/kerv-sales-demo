import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CloseIcon from '@mui/icons-material/Close';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { useLocation, useNavigate } from 'react-router-dom';
import GlassSection from '../components/GlassSection';
import kervLogo from '../assets/kerv-logo.svg';
import { contentLibrary } from '../data/contentLibrary';
import { clearError, logout, setError, updateUserSuccess } from '../features/auth/authSlice';
import { resendVerificationEmail, updateUserProfile } from '../features/auth/authService';
import '../styles/dashboard.css';

const tierSelectionOptions = [
  'Assets Summary',
  'Basic Scene',
  'Advanced Scene',
  'Categorical Product Match',
  'Exact Product Match',
];

const adPlaybackOptions = [
  'Pause Ad',
  'CTA Pause',
  'Organic Pause',
  'Carousel Shop',
  'Sync',
  'Sync: L-Bar',
  'Sync: Impulse',
  'Companion',
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, error } = useSelector((state) => state.auth);
  const [category, setCategory] = useState('All');
  const [selectedContentId, setSelectedContentId] = useState(contentLibrary[0]?.id ?? null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [demoStartDialogOpen, setDemoStartDialogOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [verificationPromptShown, setVerificationPromptShown] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [tierSelection, setTierSelection] = useState('Categorical Product Match');
  const [adPlaybackMode, setAdPlaybackMode] = useState('CTA Pause');
  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'user@example.com';
  const profileChanged =
    profileForm.name.trim() !== displayName.trim() ||
    profileForm.email.trim().toLowerCase() !== displayEmail.trim().toLowerCase();

  const categoryOptions = useMemo(
    () => ['All', ...Array.from(new Set(contentLibrary.map((item) => item.category)))],
    []
  );

  const visibleContent = useMemo(
    () =>
      contentLibrary.filter((item) => {
        if (category === 'All') {
          return true;
        }

        return item.category === category;
      }),
    [category]
  );

  useEffect(() => {
    if (!visibleContent.some((item) => item.id === selectedContentId)) {
      setSelectedContentId(visibleContent[0]?.id ?? null);
    }
  }, [selectedContentId, visibleContent]);

  useEffect(() => {
    if (!location.state?.openProfileOnEntry) {
      return;
    }

    dispatch(clearError());
    setVerificationNotice('');
    setProfileForm({
      name: displayName,
      email: displayEmail,
    });
    setProfileOpen(true);

    if (user?.emailVerified === false) {
      setVerificationDialogOpen(true);
    }

    navigate(location.pathname, { replace: true, state: {} });
  }, [dispatch, displayEmail, displayName, location.pathname, location.state, navigate, user?.emailVerified]);

  useEffect(() => {
    if (verificationPromptShown || user?.emailVerified !== false) {
      return;
    }

    dispatch(clearError());
    setVerificationNotice('');
    setProfileForm({
      name: displayName,
      email: displayEmail,
    });
    setProfileOpen(true);
    setVerificationDialogOpen(true);
    setVerificationPromptShown(true);
  }, [dispatch, displayEmail, displayName, user?.emailVerified, verificationPromptShown]);

  const handleLogout = () => {
    setMenuAnchor(null);
    dispatch(logout());
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleProfileOpen = () => {
    setMenuAnchor(null);
    dispatch(clearError());
    setVerificationNotice('');
    setProfileForm({
      name: displayName,
      email: displayEmail,
    });
    setProfileOpen(true);

    if (user?.emailVerified === false) {
      setVerificationDialogOpen(true);
    }
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  const handleVerificationDialogClose = () => {
    setVerificationDialogOpen(false);
  };

  const handleProfileChange = (event) => {
    setProfileForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleDemoStartDialogClose = () => {
    setDemoStartDialogOpen(false);
  };

  const handleDemoStartDialogOpen = (contentId) => {
    setSelectedContentId(contentId);
    setDemoStartDialogOpen(true);
  };

  const handleDemoStart = () => {
    setDemoStartDialogOpen(false);
  };

  const handleProfileSave = async () => {
    if (!profileChanged) {
      return;
    }

    dispatch(clearError());
    setProfileSaving(true);

    try {
      const updatedUser = await updateUserProfile({
        currentEmail: displayEmail,
        name: profileForm.name,
        email: profileForm.email,
        organization: user?.organization || 'Warner Bro.',
        access: user?.access?.length ? user.access : ['Search Tool'],
      });

      const emailChanged = updatedUser.email !== displayEmail.trim().toLowerCase();
      dispatch(updateUserSuccess(updatedUser));
      setProfileForm({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      if (emailChanged) {
        setVerificationNotice('');
        setVerificationDialogOpen(true);
      }
    } catch (saveError) {
      dispatch(setError(saveError.message));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await resendVerificationEmail(user?.email || profileForm.email);
      setVerificationNotice(response.message);
    } catch (verificationError) {
      dispatch(setError(verificationError.message));
    }
  };

  const handleOpenMailApp = () => {
    window.location.href = 'mailto:';
  };

  return (
    <Box className="dashboard-shell">
      <Box className="dashboard-container">
        <Box className="dashboard-topbar">
          <Box className="dashboard-brand">
            <Box component="img" src={kervLogo} alt="Kerv logo" className="dashboard-brand__icon" />
            <Typography className="dashboard-brand__tool">Sales Demo Tool</Typography>
          </Box>

          <Box className="dashboard-user-icon">
            <IconButton onClick={handleMenuOpen} className="dashboard-user-button">
              <PersonIcon className="dashboard-user-avatar" fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          classes={{ paper: 'dashboard-user-menu' }}
        >
          <Box className="dashboard-user-menu__header">
            <Typography className="dashboard-user-menu__name">{displayName}</Typography>
            <Typography className="dashboard-user-menu__email">{displayEmail}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleProfileOpen} className="dashboard-user-menu__item">
            <ListItemIcon>
              <BadgeOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} className="dashboard-user-menu__item">
            <ListItemIcon>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        </Menu>

        <Drawer
          open={profileOpen}
          onClose={handleProfileClose}
          anchor="right"
          classes={{ paper: 'dashboard-profile-drawer' }}
        >
          <Box className="dashboard-profile-drawer__content">
            {!user?.emailVerified ? (
              <Typography className="dashboard-profile-drawer__status">Email not verified</Typography>
            ) : null}
            <Typography className="dashboard-profile-dialog__title">Profile</Typography>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Stack spacing={2.25} className="dashboard-profile-drawer__fields">
              <TextField
                label="Name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                fullWidth
              />
              <Box className="dashboard-profile-drawer__email-row">
                <TextField
                  label="Email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  fullWidth
                  error={user?.emailVerified === false}
                  helperText={user?.emailVerified === false ? 'Email not verified' : ' '}
                />
                {user?.emailVerified === false ? (
                  <Button variant="outlined" onClick={handleResendVerification} className="dashboard-profile-drawer__resend">
                    Resend Email
                  </Button>
                ) : null}
              </Box>
            </Stack>
            {verificationNotice ? (
              <Typography className="dashboard-profile-drawer__notice">{verificationNotice}</Typography>
            ) : null}
          </Box>

          <Box className="dashboard-profile-dialog__actions">
            <Button variant="text" onClick={handleProfileClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleProfileSave} disabled={!profileChanged || profileSaving}>
              Save
            </Button>
          </Box>
        </Drawer>

        <Dialog
          open={verificationDialogOpen}
          onClose={handleVerificationDialogClose}
          maxWidth="xs"
          fullWidth
          classes={{ paper: 'dashboard-verification-dialog' }}
        >
          <Box className="dashboard-verification-dialog__content">
            <MarkEmailUnreadOutlinedIcon className="dashboard-verification-dialog__icon" />
            <Typography className="dashboard-verification-dialog__title">Verify your new email</Typography>
            <Typography className="dashboard-verification-dialog__text">
              We sent you an email verification request.
            </Typography>
            <Stack spacing={1.25} className="dashboard-verification-dialog__actions">
              <Button variant="contained" onClick={handleOpenMailApp}>
                Open Mail App
              </Button>
              <Button variant="outlined" onClick={handleResendVerification}>
                Resend Email
              </Button>
            </Stack>
          </Box>
        </Dialog>

        <Dialog
          open={demoStartDialogOpen}
          onClose={handleDemoStartDialogClose}
          maxWidth={false}
          classes={{ paper: 'dashboard-demo-start-dialog' }}
        >
          <Box className="dashboard-demo-start-dialog__close-row">
            <Button
              onClick={handleDemoStartDialogClose}
              className="dashboard-demo-start-dialog__close"
              aria-label="Close start demo dialog"
            >
              <CloseIcon fontSize="small" />
            </Button>
          </Box>

          <Box className="dashboard-demo-start-dialog__content">
            <Typography className="dashboard-demo-start-dialog__title">
              Please select the Tier-level and
              <br />
              Ad Playback mode to start your Demo:
            </Typography>

            <Box className="dashboard-demo-start-dialog__fields">
              <TextField
                select
                fullWidth
                label="Tier Selection"
                value={tierSelection}
                onChange={(event) => setTierSelection(event.target.value)}
                className="dashboard-demo-start-dialog__select dashboard-demo-start-dialog__select--primary"
                size="small"
              >
                {tierSelectionOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Ad Playback Mode"
                value={adPlaybackMode}
                onChange={(event) => setAdPlaybackMode(event.target.value)}
                className="dashboard-demo-start-dialog__select"
                size="small"
              >
                {adPlaybackOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <Box className="dashboard-demo-start-dialog__actions">
            <Button variant="outlined" onClick={handleDemoStartDialogClose}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleDemoStart}>
              Start
            </Button>
          </Box>
        </Dialog>

        <GlassSection className="dashboard-section-card dashboard-section-card--hero">
          <Typography component="h1" className="dashboard-hero-title">
            Content Selection
          </Typography>

          <Box className="dashboard-hero-filter">
            <TextField
              select
              fullWidth
              label="Content Category"
              value={category}
              onChange={handleCategoryChange}
              className="dashboard-category-select"
              size="small"
              SelectProps={{ displayEmpty: false }}
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </GlassSection>

        <GlassSection className="dashboard-section-card dashboard-section-card--library">
          {visibleContent.length > 0 ? (
            <Box className="dashboard-grid">
              {visibleContent.map((item) => (
                <Box
                key={item.id}
                className={selectedContentId === item.id ? 'content-card content-card--active' : 'content-card'}
                onClick={() => handleDemoStartDialogOpen(item.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleDemoStartDialogOpen(item.id);
                  }
                }}
                  role="button"
                  tabIndex={0}
                >
                  <Box className="content-card__thumbnail">
                    <img src={item.thumbnail} alt={item.title} loading="lazy" />
                  </Box>
                  <Typography className="content-card__title">{item.title}</Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box className="dashboard-empty">
              <Typography variant="h6" gutterBottom>
                No matching content found
              </Typography>
              <Typography>There is no content for the current category.</Typography>
            </Box>
          )}
        </GlassSection>
      </Box>
    </Box>
  );
}
