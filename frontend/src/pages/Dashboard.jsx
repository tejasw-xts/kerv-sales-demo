import React, { useDeferredValue, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import GlassSection from '../components/GlassSection';
import kervLogoIcon from '../assets/kerv-logo-icon.png';
import { adTypesByTier, contentLibrary, tierOptions } from '../data/contentLibrary';
import { clearError, logout, setError, updateUserSuccess } from '../features/auth/authSlice';
import { resendVerificationEmail, updateUserProfile } from '../features/auth/authService';
import '../styles/dashboard.css';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, error } = useSelector((state) => state.auth);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState('');
  const [adType, setAdType] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const deferredSearch = useDeferredValue(search);
  const availableAdTypes = tier ? adTypesByTier[tier] ?? [] : [];
  const selectionComplete = Boolean(tier && adType);

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'user@example.com';
  const organization = user?.organization || 'Warner Bro.';
  const accessItems = user?.access?.length ? user.access : ['Search Tool'];
  const profileChanged =
    profileForm.name.trim() !== displayName.trim() ||
    profileForm.email.trim().toLowerCase() !== displayEmail.trim().toLowerCase();

  const baseContent = useMemo(
    () =>
      contentLibrary.filter((item) => {
        if (!tier) {
          return true;
        }

        if (!adType) {
          return item.tier === tier;
        }

        return item.tier === tier && item.adTypes.includes(adType);
      }),
    [tier, adType]
  );

  const visibleContent = useMemo(
    () =>
      baseContent.filter((item) => {
        const searchTerm = deferredSearch.trim().toLowerCase();
        const matchesSearch =
          searchTerm === '' ||
          item.title.toLowerCase().includes(searchTerm) ||
          item.category.toLowerCase().includes(searchTerm) ||
          item.advertiserCategory.toLowerCase().includes(searchTerm);

        return matchesSearch;
      }),
    [baseContent, deferredSearch]
  );

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

  const handleTierChange = (event) => {
    const nextTier = event.target.value;
    setTier(nextTier);
    setSearch('');

    if (!adTypesByTier[nextTier]?.includes(adType)) {
      setAdType('');
    }
  };

  const handleAdTypeChange = (event) => {
    setAdType(event.target.value);
  };

  const handleBackToSelection = () => {
    setTier('');
    setAdType('');
    setSearch('');
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
        organization,
        access: accessItems,
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
      const message = await resendVerificationEmail(user?.email || profileForm.email);
      setVerificationNotice(message);
    } catch (verificationError) {
      dispatch(setError(verificationError.message));
    }
  };

  const totalAvailableForSelection = baseContent.length;
  const searchFilteredOut = totalAvailableForSelection - visibleContent.length;
  const selectionSummary = selectionComplete ? `${tier} / ${adType}` : tier ? `${tier}` : 'All videos';
  const gateMessage = !tier
    ? 'Showing all videos by default. Select a Tier to narrow the library.'
    : !adType
      ? 'Tier selected. Choose an Ad Type to narrow the results further.'
      : '';

  return (
    <Box className="dashboard-shell">
      <Box className="dashboard-topbar">
        <Box className="dashboard-brand">
          <Box component="img" src={kervLogoIcon} alt="KERV logo icon" className="dashboard-brand__icon" />
          <Typography className="dashboard-brand__tool">Sales Demo Tool</Typography>
        </Box>

        <Box className="dashboard-user-icon">
          <IconButton onClick={handleMenuOpen} className="dashboard-user-button">
            <Avatar className="dashboard-user-avatar">
              <PersonIcon fontSize="small" />
            </Avatar>
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

          <Box className="dashboard-profile-dialog__details">
            <Typography className="dashboard-profile-dialog__meta">
              <strong>Organization:</strong> {organization}
            </Typography>

            <Box className="dashboard-profile-dialog__access">
              <Typography className="dashboard-profile-dialog__meta">
                <strong>Access:</strong>
              </Typography>
              <Box component="ul" className="dashboard-profile-dialog__access-list">
                {accessItems.map((item) => (
                  <Box component="li" key={item}>
                    {item}
                  </Box>
                ))}
              </Box>
            </Box>

            {verificationNotice ? (
              <Typography className="dashboard-profile-drawer__notice">{verificationNotice}</Typography>
            ) : null}
          </Box>
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
            <Button variant="contained" onClick={handleVerificationDialogClose}>
              Open Mail App
            </Button>
            <Button variant="outlined" onClick={handleResendVerification}>
              Resend Email
            </Button>
          </Stack>
        </Box>
      </Dialog>

      <GlassSection className="dashboard-section-card dashboard-section-card--hero">
        <Box className="dashboard-back-link">
          <Button variant="text" onClick={handleBackToSelection} startIcon={<ArrowBackIcon />}>
            Back to Demo Selection
          </Button>
        </Box>

        <Typography component="h1" className="dashboard-hero-title">
          Content Selection
        </Typography>
      </GlassSection>

      <GlassSection className="dashboard-section-card dashboard-section-card--library">
        <Box className="dashboard-filters">
          <TextField
            fullWidth
            placeholder="Search Demos"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <Box>
            <Typography component="label" className="dashboard-filter-label">
              Tier Selection
            </Typography>
            <TextField select fullWidth value={tier} onChange={handleTierChange}>
              <MenuItem value="" disabled>
                Select Tier
              </MenuItem>
              {tierOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box>
            <Typography component="label" className="dashboard-filter-label">
              Ad Type
            </Typography>
            <TextField select fullWidth value={adType} onChange={handleAdTypeChange} disabled={!tier}>
              <MenuItem value="" disabled>
                Select Ad Type
              </MenuItem>
              {availableAdTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {!selectionComplete ? (
          <Alert severity="info" className="dashboard-gate-alert">
            {gateMessage}
          </Alert>
        ) : null}

        <Box className="dashboard-results">
          <Typography className="dashboard-results__count">
            Showing {visibleContent.length} of {totalAvailableForSelection} videos for {selectionSummary}
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className="dashboard-chip-row">
            {tier ? <Chip label={tier} /> : null}
            {adType ? <Chip label={adType} /> : null}
            {deferredSearch.trim() ? <Chip label={`Search: ${deferredSearch.trim()}`} /> : null}
          </Stack>
        </Box>

        {visibleContent.length > 0 ? (
          <Box className="dashboard-grid">
            {visibleContent.map((item) => (
              <Box key={item.id} className="content-card">
                <Box className="content-card__thumbnail">
                  <img src={item.thumbnail} alt={item.title} loading="lazy" />
                </Box>
                <Typography className="content-card__title">{item.title}</Typography>
                <Box className="content-card__meta">
                  <Box component="span" className="content-card__tag">
                    {item.tier}
                  </Box>
                  <Box component="span" className="content-card__tag">
                    {item.category}
                  </Box>
                  <Box component="span" className="content-card__tag">
                    {item.advertiserCategory}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box className="dashboard-empty">
            <Typography variant="h6" gutterBottom>
              No matching content found
            </Typography>
            <Typography>
              {searchFilteredOut > 0
                ? 'Try a different search term to see more demo content for the selected Tier and Ad Type.'
                : 'There is no content for the current Tier and Ad Type combination.'}
            </Typography>
          </Box>
        )}
      </GlassSection>
    </Box>
  );
}
