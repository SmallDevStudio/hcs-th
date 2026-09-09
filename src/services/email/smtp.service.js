import "server-only";

import nodemailer from "nodemailer";

import {
  decryptEmailSecret,
  hasEncryptedEmailSecret,
} from "@/services/email/email-crypto.service";

function normalizeRecipients(value) {
  const recipients = Array.isArray(value)
    ? value
    : String(value || "").split(",");

  return [
    ...new Set(
      recipients
        .map((recipient) =>
          String(recipient || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    ),
  ];
}

function getSmtpPassword(settings) {
  const encryptedPassword = settings?.smtpPasswordEncrypted || "";

  if (!encryptedPassword) {
    return "";
  }

  if (!hasEncryptedEmailSecret(encryptedPassword)) {
    throw new Error("The stored SMTP password is not encrypted correctly");
  }

  return decryptEmailSecret(encryptedPassword);
}

function validateEmailSettings(settings) {
  if (!settings?.smtpHost) {
    throw new Error("SMTP host is required");
  }

  if (!settings?.smtpPort) {
    throw new Error("SMTP port is required");
  }

  if (!settings?.smtpUsername) {
    throw new Error("SMTP username is required");
  }

  if (!settings?.smtpPasswordEncrypted) {
    throw new Error("SMTP password is required");
  }

  if (!settings?.fromEmail) {
    throw new Error("Sender email is required");
  }
}

export function createSmtpTransport(settings) {
  validateEmailSettings(settings);

  const port = Number(settings.smtpPort);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP port is invalid");
  }

  return nodemailer.createTransport({
    host: settings.smtpHost,
    port,

    secure: Boolean(settings.smtpSecure),

    auth: {
      user: settings.smtpUsername,
      pass: getSmtpPassword(settings),
    },

    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
}

export async function verifySmtpConnection(settings) {
  const transport = createSmtpTransport(settings);

  try {
    await transport.verify();

    return {
      success: true,
    };
  } finally {
    transport.close();
  }
}

export async function sendSmtpEmail({
  settings,
  to,
  subject,
  text,
  html,
  replyTo,
  attachments,
}) {
  const recipients = normalizeRecipients(to);

  if (!recipients.length) {
    throw new Error("At least one notification recipient is required");
  }

  const transport = createSmtpTransport(settings);

  try {
    const result = await transport.sendMail({
      from: {
        name: settings.fromName || "HCS Thailand",
        address: settings.fromEmail,
      },

      to: recipients,

      ...(replyTo
        ? {
            replyTo,
          }
        : {}),

      subject,
      text,
      html,

      ...(Array.isArray(attachments) && attachments.length
        ? {
            attachments,
          }
        : {}),
    });

    return {
      messageId: result.messageId || "",
      accepted: Array.isArray(result.accepted)
        ? result.accepted.map(String)
        : [],
      rejected: Array.isArray(result.rejected)
        ? result.rejected.map(String)
        : [],
      response: result.response || "",
    };
  } finally {
    transport.close();
  }
}

export async function sendSmtpTestEmail({ settings, recipient }) {
  const sentAt = new Date();

  return sendSmtpEmail({
    settings,

    to: [recipient],

    subject: "HCS Thailand SMTP Test",

    text: [
      "HCS Thailand SMTP configuration is working correctly.",
      "",
      `Tested at: ${sentAt.toISOString()}`,
    ].join("\n"),

    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#0f2740">
        <div style="background:#0979c4;padding:20px 24px;color:#ffffff">
          <strong style="font-size:20px">HCS Thailand</strong>
        </div>

        <div style="border:1px solid #dbe5ee;border-top:0;padding:24px">
          <h1 style="font-size:22px;margin:0 0 12px">
            SMTP configuration successful
          </h1>

          <p style="line-height:1.6;margin:0 0 12px">
            Your website can successfully send email using the configured SMTP server.
          </p>

          <p style="font-size:13px;color:#64748b;margin:0">
            Tested at ${sentAt.toISOString()}
          </p>
        </div>
      </div>
    `,
  });
}
