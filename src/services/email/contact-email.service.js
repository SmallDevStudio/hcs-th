import "server-only";

import { sendSmtpEmail } from "@/services/email/smtp.service";

const ENQUIRY_TYPE_LABELS = {
  product: "Product Enquiry",
  project: "Project Specification",
  technical: "Technical Support",
  partnership: "Partnership & Distribution",
  general: "General Enquiry",
};

const PRODUCT_CATEGORY_LABELS = {
  "door-closers": "Door Closers",
  "lever-handles": "Lever Handles",
  "locks-cylinders": "Locks & Cylinders",
  hinges: "Hinges",
  "panic-exit-hardware": "Panic Exit Hardware",
  "door-window-seals": "Door & Window Seals",
  "fire-doors": "Fire Doors",
  "electronic-locks": "Electronic Locks",
  other: "Other",
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getEnquiryTypeLabel(value) {
  return ENQUIRY_TYPE_LABELS[value] || value || "General Enquiry";
}

function getProductCategoryLabel(value) {
  if (!value) {
    return "Not specified";
  }

  return PRODUCT_CATEGORY_LABELS[value] || value;
}

function getAdminBaseUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";

  if (!configuredUrl) {
    return "";
  }

  const normalizedUrl =
    configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")
      ? configuredUrl
      : `https://${configuredUrl}`;

  return normalizedUrl.replace(/\/+$/, "");
}

function createAdminMessageUrl(messageId) {
  const baseUrl = getAdminBaseUrl();

  if (!baseUrl || !messageId) {
    return "";
  }

  return `${baseUrl}/admin/messages?messageId=${encodeURIComponent(messageId)}`;
}

function createTextContent({ messageId, message }) {
  const adminUrl = createAdminMessageUrl(messageId);

  return [
    "New website enquiry",
    "",
    `Name: ${message.fullName}`,
    `Company: ${message.company || "-"}`,
    `Email: ${message.email}`,
    `Phone: ${message.phone || "-"}`,
    `Enquiry type: ${getEnquiryTypeLabel(message.enquiryType)}`,
    `Product category: ${getProductCategoryLabel(message.productCategory)}`,
    `Project name: ${message.projectName || "-"}`,
    `Project location: ${message.projectLocation || "-"}`,
    `Language: ${message.locale === "th" ? "Thai" : "English"}`,
    "",
    "Message:",
    message.message,
    "",
    message.attachment
      ? `Attachment: ${message.attachment.originalName || "Attached document"}`
      : "Attachment: None",
    "",
    adminUrl ? `Open in Admin: ${adminUrl}` : "",
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

function createInformationRow(label, value) {
  return `
    <tr>
      <td
        style="
          width:160px;
          padding:9px 12px;
          border-bottom:1px solid #e2e8f0;
          color:#64748b;
          font-size:13px;
          vertical-align:top;
        "
      >
        ${escapeHtml(label)}
      </td>

      <td
        style="
          padding:9px 12px;
          border-bottom:1px solid #e2e8f0;
          color:#0f2740;
          font-size:14px;
          font-weight:600;
          vertical-align:top;
        "
      >
        ${escapeHtml(value || "-")}
      </td>
    </tr>
  `;
}

function createHtmlContent({ messageId, message }) {
  const adminUrl = createAdminMessageUrl(messageId);

  const submittedMessage = escapeHtml(message.message).replaceAll(
    "\n",
    "<br />",
  );

  const attachmentName = message.attachment?.originalName || "";

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <title>New website enquiry</title>
      </head>

      <body
        style="
          margin:0;
          padding:0;
          background:#f1f5f9;
          font-family:Arial,Helvetica,sans-serif;
        "
      >
        <div
          style="
            max-width:720px;
            margin:0 auto;
            padding:28px 16px;
          "
        >
          <div
            style="
              overflow:hidden;
              border:1px solid #dbe5ee;
              border-radius:12px;
              background:#ffffff;
            "
          >
            <div
              style="
                padding:22px 26px;
                background:#0979c4;
                color:#ffffff;
              "
            >
              <div
                style="
                  font-size:13px;
                  font-weight:700;
                  letter-spacing:1.4px;
                  text-transform:uppercase;
                  opacity:0.85;
                "
              >
                HCS Thailand Website
              </div>

              <h1
                style="
                  margin:6px 0 0;
                  font-size:25px;
                  line-height:1.25;
                "
              >
                New website enquiry
              </h1>
            </div>

            <div style="padding:24px 26px">
              <p
                style="
                  margin:0 0 20px;
                  color:#475569;
                  font-size:14px;
                  line-height:1.65;
                "
              >
                A new enquiry has been submitted through the HCS Thailand contact form.
              </p>

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border:1px solid #e2e8f0;
                  border-radius:8px;
                  border-collapse:separate;
                  border-spacing:0;
                  overflow:hidden;
                "
              >
                ${createInformationRow("Full name", message.fullName)}

                ${createInformationRow("Company", message.company)}

                ${createInformationRow("Email", message.email)}

                ${createInformationRow("Phone", message.phone)}

                ${createInformationRow(
                  "Enquiry type",
                  getEnquiryTypeLabel(message.enquiryType),
                )}

                ${createInformationRow(
                  "Product category",
                  getProductCategoryLabel(message.productCategory),
                )}

                ${createInformationRow("Project name", message.projectName)}

                ${createInformationRow(
                  "Project location",
                  message.projectLocation,
                )}

                ${createInformationRow(
                  "Language",
                  message.locale === "th" ? "Thai" : "English",
                )}

                ${createInformationRow(
                  "Attachment",
                  attachmentName || "No attachment",
                )}
              </table>

              <div
                style="
                  margin-top:22px;
                  padding:18px;
                  border-left:4px solid #0979c4;
                  border-radius:6px;
                  background:#f8fafc;
                "
              >
                <div
                  style="
                    margin-bottom:8px;
                    color:#64748b;
                    font-size:12px;
                    font-weight:700;
                    letter-spacing:0.8px;
                    text-transform:uppercase;
                  "
                >
                  Message
                </div>

                <div
                  style="
                    color:#0f2740;
                    font-size:15px;
                    line-height:1.7;
                  "
                >
                  ${submittedMessage}
                </div>
              </div>

              ${
                adminUrl
                  ? `
                    <div style="margin-top:24px">
                      <a
                        href="${escapeHtml(adminUrl)}"
                        style="
                          display:inline-block;
                          padding:12px 20px;
                          border-radius:7px;
                          background:#0979c4;
                          color:#ffffff;
                          font-size:13px;
                          font-weight:700;
                          text-decoration:none;
                        "
                      >
                        Open message in Admin
                      </a>
                    </div>
                  `
                  : ""
              }

              <p
                style="
                  margin:24px 0 0;
                  color:#94a3b8;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                You can reply directly to this email to contact the sender.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendContactEmailNotification({
  messageId,
  message,
  settings,
}) {
  if (!message?.email) {
    throw new Error("Contact email address is missing");
  }

  const enquiryType = getEnquiryTypeLabel(message.enquiryType);

  const subject = ["New enquiry", enquiryType, message.fullName]
    .filter(Boolean)
    .join(" — ");

  return sendSmtpEmail({
    settings,

    to: settings.recipients,

    replyTo: {
      name: message.fullName,
      address: message.email,
    },

    subject,

    text: createTextContent({
      messageId,
      message,
    }),

    html: createHtmlContent({
      messageId,
      message,
    }),
  });
}
