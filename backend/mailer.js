require("./loadEnv");

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const sendMail = async ({ to, subject, text, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY and MAIL_FROM must be set");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend send failed (${response.status}): ${body}`);
  }

  return response.json();
};

const transporter = { sendMail };

module.exports = { transporter };
