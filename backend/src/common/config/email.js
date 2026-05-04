import { Resend } from "resend";

let resend;

const getApiKey = () => process.env.RESEND_API_KEY || process.env.SMTP_PASS;

const requireEmailConfig = () => {
  const missing = [];

  if (!getApiKey()) missing.push("RESEND_API_KEY");
  if (!process.env.RESEND_FROM_EMAIL && !process.env.SMTP_FROM_EMAIL) {
    missing.push("RESEND_FROM_EMAIL");
  }
  if (!process.env.CLIENT_URL) missing.push("CLIENT_URL");

  if (missing.length > 0) {
    throw new Error(`Email is not configured. Missing: ${missing.join(", ")}`);
  }
};

const getResend = () => {
  if (!resend) {
    resend = new Resend(getApiKey());
  }

  return resend;
};

const getFromAddress = () => {
  const email = process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM_EMAIL;
  const name = process.env.RESEND_FROM_NAME || process.env.SMTP_FROM_NAME;
  return name ? `${name} <${email}>` : email;
};

const getClientUrl = () => process.env.CLIENT_URL.replace(/\/$/, "");

const sendEmail = async ({ to, subject, html, text }) => {
  requireEmailConfig();

  const { data, error } = await getResend().emails.send({
    from: getFromAddress(),
    to: [to],
    subject,
    html,
    text,
  });

  if (error) {
    const message = error.message || "Resend email request failed";
    const err = new Error(message);
    err.cause = error;
    throw err;
  }

  console.info("[Email] Message accepted by Resend:", {
    id: data?.id,
    to,
    subject,
  });

  return data;
};

const sendVerificationEmail = async (email, token) => {
  const url = `${getClientUrl()}/verify-email/${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your email",
    html: `<h2>Welcome!</h2><p>Click <a href="${url}">here</a> to verify your email.</p>`,
    text: `Welcome! Verify your email: ${url}`,
  });
};

const sendResetPasswordEmail = async (email, token) => {
  const url = `${getClientUrl()}/reset-password/${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html: `<h2>Password Reset</h2><p>Click <a href="${url}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
    text: `Reset your password using this link. It expires in 15 minutes: ${url}`,
  });
};

const sendOrderConfirmationEmail = async (email, order) => {
  const items = order.items
    .map((i) => `<li>${i.title} x${i.quantity} - Rs.${i.price}</li>`)
    .join("");

  await sendEmail({
    to: email,
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `<h2>Order Confirmed!</h2>
     <p>Order: ${order.orderNumber}</p>
     <ul>${items}</ul>
     <p><strong>Total: Rs.${order.totalAmount}</strong></p>`,
    text: `Order confirmed: ${order.orderNumber}. Total: Rs.${order.totalAmount}`,
  });
};

export {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendOrderConfirmationEmail,
};
