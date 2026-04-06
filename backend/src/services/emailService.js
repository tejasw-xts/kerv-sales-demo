const nodemailer = require('nodemailer');

const cleanEnvValue = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/^['"]|['"]$/g, '');
};

const getSmtpConfig = () => {
  const host = cleanEnvValue(process.env.SMTP_HOST);
  const port = Number(process.env.SMTP_PORT || 587);
  const user = cleanEnvValue(process.env.SMTP_USER);
  const pass = cleanEnvValue(process.env.SMTP_PASS).replace(/\s+/g, '');
  const from = cleanEnvValue(process.env.MAIL_FROM) || user;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user,
      pass,
    },
    from,
  };
};

const createTransporter = () => {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: smtpConfig.auth,
  });
};

async function sendResetPasswordEmail({ to, resetLink, expiresAt }) {
  const smtpConfig = getSmtpConfig();
  const transporter = createTransporter();

  if (!smtpConfig || !transporter) {
    return false;
  }

  await transporter.sendMail({
    from: smtpConfig.from,
    to,
    subject: 'KERV Sales Demo password reset',
    text: `You requested a password reset. Use this link before ${expiresAt}: ${resetLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #17203d; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">Reset your password</h2>
        <p>You requested a password reset for your KERV Sales Demo account.</p>
        <p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 18px; background: #ed005e; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p>If the button does not open, copy and paste this link into your browser:</p>
        <p>${resetLink}</p>
        <p>This link expires at ${expiresAt}.</p>
      </div>
    `,
  });

  return true;
}

async function sendVerificationEmail({ to, verificationLink, expiresAt }) {
  const smtpConfig = getSmtpConfig();
  const transporter = createTransporter();

  if (!smtpConfig || !transporter) {
    return false;
  }

  await transporter.sendMail({
    from: smtpConfig.from,
    to,
    subject: 'Verify your KERV Sales Demo email',
    text: `Verify your email before ${expiresAt}: ${verificationLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #17203d; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">Verify your email</h2>
        <p>Please verify your KERV Sales Demo email address.</p>
        <p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 18px; background: #ed005e; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Verify Email
          </a>
        </p>
        <p>If the button does not open, copy and paste this link into your browser:</p>
        <p>${verificationLink}</p>
        <p>This link expires at ${expiresAt}.</p>
      </div>
    `,
  });

  return true;
}

function isEmailSendingConfigured() {
  return Boolean(getSmtpConfig());
}

module.exports = {
  isEmailSendingConfigured,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
