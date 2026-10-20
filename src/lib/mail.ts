import { Resend } from "resend";
import { formatMoney, type Totals } from "./money";

const FROM = process.env.FOLIO_EMAIL_FROM || "Folio <hello@folio.local>";

function shell(inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f2;font-family:Helvetica,Arial,sans-serif;color:#14211c">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #dfe3dc;border-radius:14px">
<tr><td style="padding:28px 32px 0;font-size:20px;font-weight:700;letter-spacing:-0.02em">folio<span style="color:#0f7a5c">.</span></td></tr>
<tr><td style="padding:20px 32px 32px">${inner}</td></tr>
</table>
<p style="font-size:12px;color:#66736c;margin-top:16px">Folio · simple invoicing · this is a demo app, no money moves</p>
</td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string, text: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[folio mail] to=${to} subject="${subject}"\n${text}`);
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text });
  if (error) throw new Error(error.message);
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendCode(to: string, name: string, code: string) {
  const digits = code
    .split("")
    .map((d) => `<td style="width:42px;height:50px;border:1px solid #dfe3dc;border-radius:10px;background:#f4f5f2;text-align:center;font-size:24px;font-weight:700">${d}</td>`)
    .join('<td style="width:6px"></td>');
  const html = shell(`
<p style="font-size:16px;margin:0 0 16px">Hi ${esc(name)},</p>
<p style="font-size:16px;margin:0 0 20px">Here's your code to sign in to Folio. It works for 10 minutes.</p>
<table cellpadding="0" cellspacing="0"><tr>${digits}</tr></table>
<p style="font-size:14px;color:#66736c;margin:24px 0 0">If you didn't ask for this, you can ignore this email.</p>`);
  await send(to, "Your Folio sign-in code", html, `Hi ${name},\n\nYour Folio code is ${code}. It works for 10 minutes.`);
}

export async function sendResetCode(to: string, name: string, code: string) {
  const digits = code
    .split("")
    .map((d) => `<td style="width:42px;height:50px;border:1px solid #dfe3dc;border-radius:10px;background:#f4f5f2;text-align:center;font-size:24px;font-weight:700">${d}</td>`)
    .join('<td style="width:6px"></td>');
  const html = shell(`
<p style="font-size:16px;margin:0 0 16px">Hi ${esc(name)},</p>
<p style="font-size:16px;margin:0 0 20px">Someone asked to reset the password for your Folio account. If that was you, enter this code on the reset page. It works for 10 minutes.</p>
<table cellpadding="0" cellspacing="0"><tr>${digits}</tr></table>
<p style="font-size:14px;color:#66736c;margin:24px 0 0">If you didn't ask for this, you can ignore this email. Your password stays as it is.</p>`);
  await send(to, "Your Folio password reset code", html, `Hi ${name},\n\nYour Folio password reset code is ${code}. It works for 10 minutes.\n\nIf you didn't ask for this, ignore this email.`);
}

export async function sendReset(to: string, name: string, link: string) {
  const html = shell(`
<p style="font-size:16px;margin:0 0 16px">Hi ${esc(name)},</p>
<p style="font-size:16px;margin:0 0 20px">Someone asked to reset the password for your Folio account. If that was you, choose a new one here. The link works for 30 minutes.</p>
<table cellpadding="0" cellspacing="0"><tr><td style="background:#0f7a5c;border-radius:10px"><a href="${esc(link)}" style="display:inline-block;padding:12px 22px;color:#ffffff;font-weight:700;text-decoration:none;font-size:15px">Reset my password</a></td></tr></table>
<p style="font-size:13px;color:#66736c;margin:20px 0 0">Or paste this into your browser:<br><a href="${esc(link)}" style="color:#0f7a5c;word-break:break-all">${esc(link)}</a></p>
<p style="font-size:14px;color:#66736c;margin:24px 0 0">If you didn't ask for this, you can ignore this email. Your password stays as it is.</p>`);
  await send(to, "Reset your Folio password", html, `Hi ${name},\n\nTo reset your Folio password, open this link (it works for 30 minutes):\n${link}\n\nIf you didn't ask for this, ignore this email.`);
}

/** Only TestBrick inboxes get real invoice emails — a public demo never mails strangers. */
export const mailsClients = (to: string) => /@inbox\.testbrick\.com$/i.test(to);

export async function sendInvoice(to: string, from: string, number: string, totals: Totals, dueDate: string) {
  const html = shell(`
<p style="font-size:16px;margin:0 0 8px">${esc(from)} sent you an invoice.</p>
<p style="font-size:28px;font-weight:700;margin:12px 0 4px">${formatMoney(totals.total)}</p>
<p style="font-size:14px;color:#66736c;margin:0 0 20px">Invoice ${esc(number)} · due ${esc(dueDate)}</p>`);
  await send(to, `Invoice ${number} from ${from}`, html, `${from} sent you invoice ${number} for ${formatMoney(totals.total)}, due ${dueDate}.`);
}
