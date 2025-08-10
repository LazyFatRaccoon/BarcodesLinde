import nodemailer from "nodemailer";

let transporter;

function readEnv() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    FRONTEND_URL,
  } = process.env;
  return {
    SMTP_HOST,
    SMTP_PORT: Number(SMTP_PORT) || 587,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    FRONTEND_URL,
  };
}

export async function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = readEnv();
  console.log("1", SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS);
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  } else {
    const test = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: test.user, pass: test.pass },
    });
    console.log("[mailer] Using Ethereal SMTP:", test.user);
  }
  return transporter;
}

export async function verifyMailer() {
  const t = await getTransporter();
  await t.verify();
  console.log("[mailer] SMTP connection OK");
}

export async function sendInviteEmail(
  to,
  { username, tempPassword, loginUrl }
) {
  const t = await getTransporter();
  const { SMTP_FROM, SMTP_USER, FRONTEND_URL } = readEnv();
  const from =
    SMTP_FROM || `Barcodes Linde <${SMTP_USER || "no-reply@example.com"}>`;
  const url =
    loginUrl ||
    (FRONTEND_URL ? `${FRONTEND_URL}/login` : "http://localhost:5173/login");

  const info = await t.sendMail({
    from,
    to,
    subject: "Запрошення до системи Barcodes Linde",
    html: `<div>Логін: <b>${to}</b><br/>Пароль: <b>${tempPassword}</b><br/>
           Посилання: <a href="${url}">${url}</a></div>`,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log("[mailer] Preview URL:", preview);
}
