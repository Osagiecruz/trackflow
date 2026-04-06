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

async function sendClientCredentials({ name, email, username, password, trackingId, origin, destination, estimatedDelivery }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';

  const loginUrl = `${process.env.FRONTEND_URL}/client/login`;
  const eta = estimatedDelivery
    ? new Date(estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : 'To be confirmed';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0D0E0F;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0E0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:24px;">
          <span style="font-size:20px;font-weight:800;color:#F2EFE8;">Track<span style="color:#E8A020;">Flow</span></span>
        </td></tr>
        <tr><td style="background:#161819;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#F2EFE8;">Your shipment is on its way!</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#8A8880;line-height:1.6;">Hi ${name}, a package is being sent to you. Use the credentials below to track it in real time.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1E2022;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:11px;color:#5A5855;text-transform:uppercase;letter-spacing:0.08em;">Route</p>
              <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#F2EFE8;">${origin} → ${destination}</p>
              <p style="margin:0 0 4px;font-size:11px;color:#5A5855;text-transform:uppercase;letter-spacing:0.08em;">Estimated Delivery</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:#E8A020;">${eta}</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#262A2D;border-radius:12px;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:11px;color:#5A5855;text-transform:uppercase;letter-spacing:0.08em;">Your Login Username</p>
              <p style="margin:0 0 16px;font-size:22px;font-weight:800;color:#4A9EE8;font-family:monospace;">${username}</p>
              <p style="margin:0 0 4px;font-size:11px;color:#5A5855;text-transform:uppercase;letter-spacing:0.08em;">Your Password</p>
              <p style="margin:0;font-size:22px;font-weight:800;color:#3DB87A;font-family:monospace;">${password}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 20px;font-size:13px;color:#8A8880;line-height:1.6;">Keep these credentials safe. You can log in at any time to track your package.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${loginUrl}" style="display:inline-block;background:#E8A020;color:#0D0E0F;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">Track My Package →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#5A5855;text-align:center;">Tracking ID: <span style="font-family:monospace;">${trackingId}</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sgMail.send({
    to: email,
    from: FROM,
    subject: `Your package is on its way — Login to track it`,
    html,
    text: `Hi ${name}, your shipment (${trackingId}) from ${origin} to ${destination} is on its way.\n\nLogin at ${loginUrl}\nUsername: ${username}\nPassword: ${password}\n\nEstimated delivery: ${eta}`,
  });

  logger.info(`Client credentials email sent to ${email}`);
}

async function sendAgencyApproved({ name, email, password }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';
  const loginUrl = `${process.env.FRONTEND_URL}/login`;
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:40px 20px;background:#0D0E0F;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td style="padding-bottom:24px;">
        <span style="font-size:20px;font-weight:800;color:#F2EFE8;">Track<span style="color:#E8A020;">Flow</span></span>
      </td></tr>
      <tr><td style="background:#161819;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
        <div style="display:inline-block;background:rgba(61,184,122,0.15);border:1px solid rgba(61,184,122,0.3);color:#3DB87A;font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;margin-bottom:20px;">✓ Approved</div>
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#F2EFE8;">Welcome to TrackFlow, ${name}!</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#8A8880;line-height:1.6;">Your agency account has been approved. Here are your login credentials:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#262A2D;border-radius:12px;margin-bottom:24px;">
          <tr><td style="padding:20px 24px;">
            <p style="margin:0 0 4px;font-size:11px;color:#5A5855;text-transform:uppercase;letter-spacing:0.08em;">Email</p>
            <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#F2EFE8;">${email}</p>
            <p style="margin:0 0 4px;font-size:11px;color:#5A5855;text-transform:uppercase;letter-spacing:0.08em;">Temporary Password</p>
            <p style="margin:0;font-size:20px;font-weight:800;color:#3DB87A;font-family:monospace;">${password}</p>
          </td></tr>
        </table>
        <p style="margin:0 0 20px;font-size:13px;color:#8A8880;">Please change your password after your first login.</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <a href="${loginUrl}" style="display:inline-block;background:#E8A020;color:#0D0E0F;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">Login to Dashboard →</a>
        </td></tr></table>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;

  await sgMail.send({
    to: email,
    from: FROM,
    subject: 'Your TrackFlow agency account is approved',
    html,
    text: `Hi ${name}, your agency account has been approved!\n\nEmail: ${email}\nPassword: ${password}\n\nLogin at: ${loginUrl}`,
  });
}

async function sendAgencyRejected({ name, email, note }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';
  await sgMail.send({
    to: email,
    from: FROM,
    subject: 'Update on your TrackFlow agency request',
    html: `<div style="font-family:sans-serif;padding:32px;background:#0D0E0F;color:#F2EFE8;"><h2>Hi ${name},</h2><p>After reviewing your request, we're unable to approve your TrackFlow agency account at this time.</p>${note ? `<p><strong>Reason:</strong> ${note}</p>` : ''}<p>You're welcome to reapply in the future. Contact us if you have questions.</p></div>`,
    text: `Hi ${name}, unfortunately we couldn't approve your agency request at this time.${note ? ` Reason: ${note}` : ''} Please contact us if you have questions.`,
  });
}

async function sendQuotationReady({ to, recipientName, trackingId, total, currency, items, btcAddress, ethAddress, notes }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';
  const loginUrl = `${process.env.FRONTEND_URL}/client/login`;
  const itemRows = items.map(i => `
    <tr>
      <td style="padding:10px 0;font-size:14px;color:#F2EFE8;border-bottom:1px solid rgba(255,255,255,0.06);">${i.description}</td>
      <td style="padding:10px 0;font-size:14px;color:#F2EFE8;text-align:right;border-bottom:1px solid rgba(255,255,255,0.06);">${currency} ${parseFloat(i.amount).toFixed(2)}</td>
    </tr>`).join('');
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:40px 20px;background:#0D0E0F;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td style="padding-bottom:24px;"><span style="font-size:20px;font-weight:800;color:#F2EFE8;">Track<span style="color:#E8A020;">Flow</span></span></td></tr>
      <tr><td style="background:#161819;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
        <div style="display:inline-block;background:rgba(74,158,232,0.15);border:1px solid rgba(74,158,232,0.3);color:#4A9EE8;font-size:11px;font-weight:700;padding:5px 14px;border-radius:20px;margin-bottom:20px;text-transform:uppercase;letter-spacing:0.06em;">Payment Required</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#F2EFE8;">Quotation for your shipment</h1>
        <p style="margin:0 0 24px;font-size:14px;color:#8A8880;">Hi ${recipientName}, please review and complete payment for shipment <span style="font-family:monospace;color:#E8A020;">${trackingId}</span>.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1E2022;border-radius:12px;padding:20px;margin-bottom:20px;">
          <tr><td colspan="2" style="padding-bottom:12px;font-size:11px;color:#5A5855;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;">Invoice Items</td></tr>
          ${itemRows}
          <tr><td style="padding-top:14px;font-size:16px;font-weight:800;color:#F2EFE8;">Total</td>
              <td style="padding-top:14px;font-size:16px;font-weight:800;color:#E8A020;text-align:right;">${currency} ${parseFloat(total).toFixed(2)}</td></tr>
        </table>
        ${btcAddress ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#262A2D;border-radius:10px;margin-bottom:12px;"><tr><td style="padding:14px 18px;"><p style="margin:0 0 4px;font-size:11px;color:#5A5855;text-transform:uppercase;letter-spacing:0.08em;">Bitcoin (BTC) Address</p><p style="margin:0;font-size:13px;font-family:monospace;color:#F7931A;word-break:break-all;">${btcAddress}</p></td></tr></table>` : ''}
        ${ethAddress ? `<table width="100%" cellpadding="0" cellspacing="0" style="background:#262A2D;border-radius:10px;margin-bottom:20px;"><tr><td style="padding:14px 18px;"><p style="margin:0 0 4px;font-size:11px;color:#5A5855;text-transform:uppercase;letter-spacing:0.08em;">Ethereum (ETH) Address</p><p style="margin:0;font-size:13px;font-family:monospace;color:#627EEA;word-break:break-all;">${ethAddress}</p></td></tr></table>` : ''}
        ${notes ? `<p style="margin:0 0 20px;font-size:13px;color:#8A8880;line-height:1.6;background:#1E2022;padding:14px 18px;border-radius:10px;">${notes}</p>` : ''}
        <p style="margin:0 0 20px;font-size:13px;color:#8A8880;">After paying, log in to your tracking portal and click <strong style="color:#F2EFE8;">"I've paid"</strong> to notify the agency.</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
          <a href="${loginUrl}" style="display:inline-block;background:#E8A020;color:#0D0E0F;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">Login to Pay →</a>
        </td></tr></table>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
  await sgMail.send({ to, from: FROM, subject: `Payment required — Shipment ${trackingId}`, html, text: `Quotation for shipment ${trackingId}. Total: ${currency} ${total}. Login at ${loginUrl} to pay.` });
}

async function sendPaymentNotification({ to, agencyName, trackingId, cryptoCurrency, message, total, currency }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard/shipments`;
  await sgMail.send({
    to, from: FROM,
    subject: `Payment submitted — Shipment ${trackingId}`,
    html: `<div style="font-family:sans-serif;padding:32px;background:#0D0E0F;color:#F2EFE8;"><h2 style="color:#E8A020;">Payment Notification</h2><p>A client has submitted payment for shipment <strong>${trackingId}</strong>.</p><table style="width:100%;background:#1E2022;border-radius:10px;padding:16px;margin:16px 0;"><tr><td style="color:#8A8880;padding:6px 0;">Crypto</td><td>${cryptoCurrency}</td></tr><tr><td style="color:#8A8880;padding:6px 0;">Amount</td><td>${currency} ${parseFloat(total).toFixed(2)}</td></tr>${message ? `<tr><td style="color:#8A8880;padding:6px 0;vertical-align:top;">Message</td><td>${message}</td></tr>` : ''}</table><p>Please verify payment in your wallet and confirm in your dashboard.</p><a href="${dashboardUrl}" style="display:inline-block;background:#E8A020;color:#0D0E0F;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;">Go to Dashboard →</a></div>`,
    text: `Payment submitted for shipment ${trackingId}. Crypto: ${cryptoCurrency}. Amount: ${currency} ${total}.${message ? ` Message: ${message}` : ''} Verify and confirm at ${dashboardUrl}.`,
  });
}

async function sendPaymentConfirmed({ to, recipientName, trackingId, total, currency }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';
  const trackingUrl = `${process.env.FRONTEND_URL}/client/tracking`;
  await sgMail.send({
    to, from: FROM,
    subject: `Payment confirmed — Shipment ${trackingId}`,
    html: `<div style="font-family:sans-serif;padding:32px;background:#0D0E0F;color:#F2EFE8;"><div style="display:inline-block;background:rgba(61,184,122,0.15);border:1px solid rgba(61,184,122,0.3);color:#3DB87A;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;margin-bottom:20px;">✓ Payment Confirmed</div><h2 style="color:#F2EFE8;">Your payment has been confirmed!</h2><p>Hi ${recipientName}, your payment of <strong>${currency} ${parseFloat(total).toFixed(2)}</strong> for shipment <span style="font-family:monospace;color:#E8A020;">${trackingId}</span> has been confirmed.</p><a href="${trackingUrl}" style="display:inline-block;background:#E8A020;color:#0D0E0F;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">Track My Package →</a></div>`,
    text: `Payment confirmed for shipment ${trackingId}. Amount: ${currency} ${total}. Track at ${trackingUrl}.`,
  });
}

async function sendSubscriptionActivated({ to, name, plan, billingCycle, periodEnd, shipmentsPerMonth }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';
  const endDate = new Date(periodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  await sgMail.send({
    to, from: FROM,
    subject: `Your TrackFlow ${plan} plan is now active`,
    html: `<div style="font-family:sans-serif;padding:32px;background:#0D0E0F;color:#F2EFE8;"><div style="display:inline-block;background:rgba(232,160,32,0.15);border:1px solid rgba(232,160,32,0.3);color:#E8A020;font-size:12px;font-weight:700;padding:5px 14px;border-radius:20px;margin-bottom:20px;">✓ Subscription Active</div><h2>Welcome to the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan, ${name}!</h2><table style="width:100%;background:#1E2022;border-radius:10px;padding:16px;margin:16px 0;"><tr><td style="color:#8A8880;padding:6px 0;">Plan</td><td style="font-weight:700;">${plan.charAt(0).toUpperCase() + plan.slice(1)}</td></tr><tr><td style="color:#8A8880;padding:6px 0;">Billing</td><td>${billingCycle}</td></tr><tr><td style="color:#8A8880;padding:6px 0;">Shipments/month</td><td>${shipmentsPerMonth === -1 ? 'Unlimited' : shipmentsPerMonth}</td></tr><tr><td style="color:#8A8880;padding:6px 0;">Renews</td><td>${endDate}</td></tr></table><a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:#E8A020;color:#0D0E0F;padding:12px 28px;border-radius:10px;font-weight:700;text-decoration:none;">Go to Dashboard →</a></div>`,
    text: `Your TrackFlow ${plan} plan is now active. ${shipmentsPerMonth} shipments/month. Renews ${endDate}.`,
  });
}

async function sendSubscriptionRejected({ to, name, plan, note }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';
  await sgMail.send({
    to, from: FROM,
    subject: 'Update on your TrackFlow subscription payment',
    html: `<div style="font-family:sans-serif;padding:32px;background:#0D0E0F;color:#F2EFE8;"><h2>Hi ${name},</h2><p>We were unable to verify your payment for the ${plan} plan.</p>${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}<p>Please resubmit your payment or contact us if you need assistance.</p></div>`,
    text: `Hi ${name}, we couldn't verify your ${plan} plan payment.${note ? ` Note: ${note}` : ''} Please resubmit or contact us.`,
  });
}

async function sendAdminNotification({ subject, message }) {
  if (process.env.NODE_ENV === 'test') return 'test_id';

  const adminEmail = process.env.ADMIN_EMAIL || process.env.SENDGRID_FROM_EMAIL;
  if (!adminEmail) {
    logger.warn('ADMIN_EMAIL not set, skipping admin notification');
    return;
  }

  await sgMail.send({
    to: adminEmail,
    from: FROM,
    subject: `[TrackFlow Admin] ${subject}`,
    html: `<div style="font-family:sans-serif;padding:32px;background:#0D0E0F;color:#F2EFE8;">
      <h2 style="color:#E8A020;">${subject}</h2>
      <p style="color:#8A8880;line-height:1.6;">${message}</p>
    </div>`,
    text: `${subject}\n\n${message}`,
  });

  logger.info(`Admin notification sent: ${subject}`);
}

module.exports = {
  sendStatusUpdate,
  sendWelcome,
  sendPasswordReset,
  sendRaw,
  sendClientCredentials,
  sendAgencyApproved,
  sendAgencyRejected,
  sendAdminNotification,
  sendQuotationReady,
  sendPaymentNotification,
  sendPaymentConfirmed,
  sendSubscriptionActivated,
  sendSubscriptionRejected,
};

// module.exports = {
//   sendStatusUpdate,
//   sendWelcome,
//   sendPasswordReset,
//   sendRaw,
//   sendClientCredentials,
//   sendAgencyApproved,
//   sendAgencyRejected,
//   sendAdminNotification,
// };
