require("./loadEnv");

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const sendMail = async ({ to, subject, text, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.MAIL_FROM;
  const fromName = process.env.MAIL_FROM_NAME || "Chatenko";

  if (!apiKey || !fromEmail) {
    throw new Error("BREVO_API_KEY and MAIL_FROM must be set");
  }

  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo send failed (${response.status}): ${body}`);
  }

  return response.json();
};

const transporter = { sendMail };

module.exports = { transporter };
