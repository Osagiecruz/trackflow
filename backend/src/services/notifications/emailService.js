const sgMail = require('@sendgrid/mail');
const logger = require('../../utils/logger');

sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'SG.placeholder');

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL || 'noreply@localhost.com',
  name: process.env.SENDGRID_FROM_NAME || 'TrackFlow Notifications',
};

const STATUS_LABELS = {
  pending: 'Shipment Created',
  in_transit: 'In Transit',
  customs_cleared: 'Customs Cleared',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  exception: 'Delivery Exception',
};

const STATUS_COLORS = {
  pending: '#4A9EE8',
  in_transit: '#E8A020',
  customs_cleared: '#8B5CF6',
  out_for_delivery: '#F59E0B',
  delivered: '#3DB87A',
  exception: '#E24B4A',
};

function buildStatusEmailHtml({ trackingId, status, description, location, estimatedDelivery }) {
  const label = STATUS_LABELS[status] || 'Update';
  const color = STATUS_COLORS[status] || '#E8A020';
  const eta = estimatedDelivery
    ? new Date(estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : null;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TrackFlow — ${label}</title>
</head>
<body style="margin:0;padding:0;background:#0D0E0F;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0E0F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:18px;font-weight:800;color:#F2EFE8;letter-spacing:-0.02em;">Track<span style="color:${color}">Flow</span></span>
                  </td>
                  <td align="right">
                    <span style="font-family:monospace;font-size:11px;color:#5A5855;">${trackingId}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Card -->
          <tr>
            <td style="background:#161819;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:24px;">
              <div style="display:inline-block;background:${color}22;border:1px solid ${color}55;color:${color};font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:20px;">${label}</div>
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#F2EFE8;letter-spacing:-0.03em;line-height:1.2;">${description || label}</h1>
              ${location ? `<p style="margin:0 0 20px;font-size:14px;color:#8A8880;">📍 ${location}</p>` : ''}
              ${eta ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1E2022;border-radius:10px;margin-top:20px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#5A5855;text-transform:uppercase;letter-spacing:0.08em;">Estimated Delivery</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#F2EFE8;">${eta}</p>
                  </td>
                </tr>
              </table>` : ''}
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.FRONTEND_URL}/track/${trackingId}"
                       style="display:inline-block;background:${color};color:#0D0E0F;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.01em;">
                      View Full Tracking →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#5A5855;text-align:center;line-height:1.6;">
                You're receiving this because you're tracking shipment ${trackingId}.<br>
                <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color:#8A8880;">Unsubscribe</a> · 
                <a href="${process.env.FRONTEND_URL}/privacy" style="color:#8A8880;">Privacy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendStatusUpdate({ to, trackingId, status, description, location, estimatedDelivery }) {
  const label = STATUS_LABELS[status] || 'Shipment Update';

  if (process.env.NODE_ENV === 'test') {
    logger.info(`[TEST] Email to ${to}: ${label} for ${trackingId}`);
    return 'test_message_id';
  }

  const msg = {
  to,
  from: FROM,
  subject: `${label} — Shipment ${trackingId}`,
  html: buildStatusEmailHtml({ trackingId, status, description, location, estimatedDelivery }),
  text: `${label}: ${description || ''} ${location ? `at ${location}` : ''}. Track: ${process.env.FRONTEND_URL}/track/${trackingId}`,
  headers: {
    'List-Unsubscribe': `<${process.env.FRONTEND_URL}/unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  },
  trackingSettings: {
    clickTracking: { enable: false },
    openTracking: { enable: false },
  },
};

  const [response] = await sgMail.send(msg);
  logger.info(`Email sent to ${to}: ${response.headers['x-message-id']}`);
  return response.headers['x-message-id'];
}

async function sendWelcome({ name, email }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';

  await sgMail.send({
    to: email,
    from: FROM,
    subject: 'Welcome to TrackFlow',
    html: `<p>Hi ${name}, welcome to TrackFlow! Your agency account is ready.</p>`,
    text: `Hi ${name}, welcome to TrackFlow! Your agency account is ready.`,
  });
}

async function sendPasswordReset({ name, email, token }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';

  const resetUrl = `${process.env.FRONTEND_URL || 'https://trackflow.io'}/reset-password?token=${token}`;
  await sgMail.send({
    to: email,
    from: FROM,
    subject: 'Reset your TrackFlow password',
    html: `<p>Hi ${name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
    text: `Hi ${name}, reset your password: ${resetUrl}`,
  });
}

async function sendRaw(to, subject, html) {
  if (process.env.NODE_ENV === 'test') return 'test_id';
  await sgMail.send({ to, from: FROM, subject, html, text: html.replace(/<[^>]+>/g, '') });
}

module.exports = { sendStatusUpdate, sendWelcome, sendPasswordReset, sendRaw };
