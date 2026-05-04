import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure =
  process.env.SMTP_SECURE === "true" || (process.env.SMTP_SECURE !== "false" && smtpPort === 465);

// SMTP transporter - works with Resend, Mailtrap, Gmail, SendGrid, or any SMTP provider.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpSecure,
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS) || 10_000,
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS) || 10_000,
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS) || 15_000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const requireEmailConfig = () => {
  const missing = [
    "SMTP_HOST",
    "SMTP_USER",
    "SMTP_PASS",
    "SMTP_FROM_EMAIL",
    "CLIENT_URL",
  ].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Email is not configured. Missing: ${missing.join(", ")}`);
  }
};

const sendEmail = async (to, subject, html) => {
  requireEmailConfig();

  const info = await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
    to,
    subject,
    html,
  });

  console.info("Email accepted by SMTP provider:", {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  });
};

const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail(
    email,
    "Verify your email",
    `<h2>Welcome!</h2><p>Click <a href="${url}">here</a> to verify your email.</p>`,
  );
};

const sendResetPasswordEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail(
    email,
    "Reset your password",
    `<h2>Password Reset</h2><p>Click <a href="${url}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
  );
};

const sendOrderConfirmationEmail = async (email, order) => {
  const items = order.items
    .map((i) => `<li>${i.title} x${i.quantity} — ₹${i.price}</li>`)
    .join("");

  await sendEmail(
    email,
    `Order Confirmed — ${order.orderNumber}`,
    `<h2>Order Confirmed!</h2>
     <p>Order: ${order.orderNumber}</p>
     <ul>${items}</ul>
     <p><strong>Total: ₹${order.totalAmount}</strong></p>`,
  );
};

export {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendOrderConfirmationEmail,
};
