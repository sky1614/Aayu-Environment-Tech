const nodemailer = require('nodemailer');
const config = require('../config');

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: config.SMTP_USER && config.SMTP_PASS
    ? { user: config.SMTP_USER, pass: config.SMTP_PASS }
    : undefined,
});

const BRAND_GREEN = '#1f7a3f';

function fieldRow(label, value) {
  if (!value) return '';
  return `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#374151;">${label}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#111827;">${value}</td>
    </tr>`;
}

function adminEmailHtml(lead) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:${BRAND_GREEN};padding:20px 24px;border-radius:8px 8px 0 0;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;">Aayu EnviroTech — New Lead</h1>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
      <table style="width:100%;border-collapse:collapse;">
        ${fieldRow('Name', lead.name)}
        ${fieldRow('Email', lead.email)}
        ${fieldRow('Phone', lead.phone)}
        ${fieldRow('Company', lead.company)}
        ${fieldRow('Project Type', lead.projectType)}
        ${fieldRow('Message', lead.message)}
      </table>
    </div>
  </div>`;
}

function confirmationEmailHtml(lead) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;">
    <div style="background:${BRAND_GREEN};padding:24px;border-radius:8px 8px 0 0;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;">Aayu EnviroTech</h1>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px;color:#111827;">
      <p style="font-size:16px;">Thank you ${lead.name}, we received your enquiry.</p>
      <p>Our team will contact you within 24 hours.</p>
      <h3 style="margin-top:24px;color:${BRAND_GREEN};">Your submission</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${fieldRow('Project Type', lead.projectType)}
        ${fieldRow('Message', lead.message)}
      </table>
      <p style="margin-top:24px;">If you have any questions, reach us at
        <a href="mailto:info@aayuenviro.com" style="color:${BRAND_GREEN};">info@aayuenviro.com</a>.
      </p>
    </div>
  </div>`;
}

async function sendLeadNotification(lead) {
  return transporter.sendMail({
    from: config.SMTP_USER,
    to: config.ADMIN_EMAIL,
    subject: `New Lead: ${lead.name} - ${lead.projectType || 'General Enquiry'}`,
    html: adminEmailHtml(lead),
  });
}

async function sendLeadConfirmation(lead) {
  return transporter.sendMail({
    from: config.SMTP_USER,
    to: lead.email,
    subject: 'Thank you for contacting Aayu EnviroTech',
    html: confirmationEmailHtml(lead),
  });
}

module.exports = { sendLeadNotification, sendLeadConfirmation };
