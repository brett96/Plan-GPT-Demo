/**
 * Vercel Serverless: BookCover interest form → email (Google Workspace SMTP) + optional Google Sheet (Apps Script webhook).
 *
 * Env:
 *   SMTP_HOST            — e.g. smtp.gmail.com
 *   SMTP_PORT            — 465 (SSL) or 587 (STARTTLS)
 *   SMTP_SECURE          — "true" for 465, "false" for 587
 *   SMTP_USER            — Google Workspace mailbox (e.g. info@cercalabs.com)
 *   SMTP_PASS            — App Password (recommended) or SMTP relay credentials
 *   SMTP_FROM            — Optional From header override (defaults to SMTP_USER)
 *   BOOKCOVER_NOTIFY_EMAIL — default info@cercalabs.com
 *   GOOGLE_APPS_SCRIPT_URL — deployed Web App URL (POST JSON) for Sheet append
 *   GOOGLE_APPS_SCRIPT_SECRET — shared secret checked by the script
 */

import nodemailer from "nodemailer";

function buildEmailBody(payload) {
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Company / organization: ${payload.company || "(not provided)"}`,
    `Phone: ${payload.phone || "(not provided)"}`,
    `I am interested as: ${payload.role || "(not provided)"}`,
    "",
    "Message:",
    payload.message || "(none)",
    "",
    `Submitted (UTC): ${payload.submittedAt}`,
  ];
  return lines.join("\n");
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }

  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Expected JSON object" });
  }

  // Honeypot — leave empty in real browsers
  if (body._companyWebsite) {
    return res.status(200).json({ ok: true });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const company = String(body.company || "").trim();
  const phone = String(body.phone || "").trim();
  const role = String(body.role || "").trim();
  const message = String(body.message || "").trim();

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const submittedAt = new Date().toISOString();
  const payload = { name, email, company, phone, role, message, submittedAt };

  const notifyEmail = process.env.BOOKCOVER_NOTIFY_EMAIL || "info@cercalabs.com";
  const subject = `BookCover Inquiry - ${name}`;
  const text = buildEmailBody(payload);

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || "465");
  const smtpSecure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  const errors = [];

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to: notifyEmail,
        replyTo: email,
        subject,
        text,
      });
    } catch (e) {
      errors.push(`Email send failed: ${e.message || e}`);
    }
  } else {
    errors.push("Email is not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS).");
  }

  const sheetUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const sheetSecret = process.env.GOOGLE_APPS_SCRIPT_SECRET || "";

  if (sheetUrl) {
    try {
      const r = await fetch(sheetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: sheetSecret,
          ...payload,
        }),
      });
      const textOut = await r.text();
      const looksLikeHtml =
        textOut.trim().startsWith("<!DOCTYPE") ||
        textOut.includes("<html") ||
        textOut.includes("Access Denied");

      if (!r.ok) {
        const hint = looksLikeHtml
          ? " — URL must be the deployed Web App endpoint ending in /exec (Deploy → Web app → copy URL), not script.google.com/.../edit. Set access to Anyone."
          : "";
        const preview = looksLikeHtml ? " [HTML error page]" : ` ${textOut.slice(0, 200)}`;
        errors.push(`Sheet webhook failed: ${r.status}${hint}${preview}`);
      } else if (looksLikeHtml) {
        errors.push(
          "Sheet webhook returned HTML instead of JSON — check GOOGLE_APPS_SCRIPT_URL uses the /exec deployment URL.",
        );
      } else {
        try {
          const j = JSON.parse(textOut);
          if (j && j.ok === false && j.error) {
            errors.push(`Sheet webhook: ${j.error}`);
          }
        } catch {
          /* non-JSON success is ok */
        }
      }
    } catch (e) {
      errors.push(`Sheet webhook failed: ${e.message || e}`);
    }
  } else {
    errors.push("Google Sheet is not configured (set GOOGLE_APPS_SCRIPT_URL).");
  }

  if (errors.length) {
    console.error("[bookcover-inquiry]", errors.join(" | "));
    return res.status(502).json({
      error:
        "Submission could not be completed. Please try again or email info@cercalabs.com directly.",
    });
  }

  return res.status(200).json({ ok: true });
}
