import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import '../styles/auth.css';

function KervMark({ compact = false }) {
  return (
    <Box className={compact ? 'kerv-mark kerv-mark--compact' : 'kerv-mark'} aria-hidden="true">
      <Box className="kerv-mark__circle">
        <Box className="kerv-mark__shape kerv-mark__shape--one" />
        <Box className="kerv-mark__shape kerv-mark__shape--two" />
        <Box className="kerv-mark__shape kerv-mark__shape--three" />
        <Box className="kerv-mark__shape kerv-mark__shape--four" />
      </Box>
    </Box>
  );
}

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  formTitle,
  footer,
  compactLogo,
  logoImage,
  brandName = (
    <>
      KERV <em>One</em>
    </>
  ),
  separateBrandName = false,
  showHeroBranding = true,
  solidBrandPanel = false,
  children,
}) {
  return (
    <Box className="auth-shell">
      <Box className="auth-card">
        <Box className="auth-card__panel auth-card__panel--form">
          <Stack spacing={4} className="auth-form-stack">
            <Stack spacing={2.5}>
              <Box className={separateBrandName ? 'auth-brand auth-brand--small auth-brand--separated' : 'auth-brand auth-brand--small'}>
                {compactLogo ? (
                  <Box className="auth-brand__image-wrap" aria-hidden="true">
                    <Box
                      component="img"
                      src={compactLogo.src}
                      alt={compactLogo.alt}
                      className="auth-brand__image"
                    />
                  </Box>
                ) : logoImage ? (
                  <Box className="auth-brand__image-wrap" aria-hidden="true">
                    <Box
                      component="img"
                      src={logoImage.src}
                      alt={logoImage.alt}
                      className="auth-brand__image auth-brand__image--small"
                    />
                  </Box>
                ) : (
                  <KervMark compact />
                )}
                <Typography component="span" className="auth-brand__text auth-brand__text--small">
                  {brandName}
                </Typography>
              </Box>

              <Stack spacing={1}>
                {eyebrow ? <Typography className="auth-eyebrow">{eyebrow}</Typography> : null}
                <Typography variant="h2" className="auth-title">
                  {title}
                </Typography>
                {subtitle ? <Typography className="auth-subtitle">{subtitle}</Typography> : null}
              </Stack>
            </Stack>

            <Stack spacing={2.5}>
              <Typography className="auth-form-title">{formTitle}</Typography>
              {children}
            </Stack>

            {footer ? <Box className="auth-footer">{footer}</Box> : null}
          </Stack>
        </Box>

        <Box
          className={
            solidBrandPanel ? 'auth-card__panel auth-card__panel--brand auth-card__panel--brand-solid' : 'auth-card__panel auth-card__panel--brand'
          }
        >
          <Stack spacing={5} alignItems="center" justifyContent="center" className="auth-brand-panel">
            {showHeroBranding ? (
              <>
                {logoImage ? (
                  <Box className="auth-brand__hero-image-wrap" aria-hidden="true">
                    <Box
                      component="img"
                      src={logoImage.src}
                      alt={logoImage.alt}
                      className="auth-brand__hero-image"
                    />
                  </Box>
                ) : (
                  <KervMark />
                )}
                <Typography component="div" className="auth-brand__text auth-brand__text--hero">
                  {brandName}
                </Typography>
              </>
            ) : null}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
