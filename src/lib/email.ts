import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "MisFinanzas <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendVerificationEmail(
  email: string,
  nombre: string,
  token: string
) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurado, skipping email");
    console.log(`[email:dev] Verify URL: ${APP_URL}/verify?token=${token}`);
    return { success: true, id: "dev-skip" };
  }
  const url = `${APP_URL}/verify?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verifica tu email en MisFinanzas",
    html: renderVerificationHtml(nombre, url),
  });
}

export async function sendResetEmail(
  email: string,
  nombre: string,
  token: string
) {
  if (!resend) {
    console.log(`[email:dev] Reset URL: ${APP_URL}/reset?token=${token}`);
    return { success: true, id: "dev-skip" };
  }
  const url = `${APP_URL}/reset?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Restablece tu contraseña — MisFinanzas",
    html: renderResetHtml(nombre, url),
  });
}

function renderVerificationHtml(nombre: string, url: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Verifica tu email</title></head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.06);">
        <tr><td style="padding:40px 40px 0;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#2F3E4D;margin-bottom:8px;">MisFinanzas</div>
          <div style="font-size:13px;color:#6C7A89;">Tu contador personal digital</div>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <h1 style="margin:0 0 12px;font-size:22px;color:#2F3E4D;">Hola ${nombre},</h1>
          <p style="margin:0 0 24px;color:#4a5b6e;line-height:1.6;">
            Bienvenida a MisFinanzas. Para activar tu cuenta y empezar a gestionar tus finanzas
            con estándares de contador auditor, por favor verifica tu email:
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="display:inline-block;background:#2F3E4D;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">Verificar email</a>
          </div>
          <p style="margin:0;font-size:13px;color:#6C7A89;line-height:1.5;">
            O copia este link: <br><span style="color:#2563eb;word-break:break-all;">${url}</span>
          </p>
          <p style="margin:24px 0 0;font-size:13px;color:#a0adbd;">Este link expira en 24 horas.</p>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f4f6fa;text-align:center;font-size:12px;color:#a0adbd;">
          Si no te registraste, ignora este mensaje.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderResetHtml(nombre: string, url: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#f4f6fa;padding:40px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;">
    <h1 style="color:#2F3E4D;">Restablecer contraseña</h1>
    <p>Hola ${nombre}, recibimos tu solicitud para restablecer contraseña.</p>
    <a href="${url}" style="display:inline-block;background:#2F3E4D;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;">Restablecer</a>
    <p style="font-size:12px;color:#a0adbd;margin-top:24px;">Este link expira en 1 hora. Si no fuiste tú, ignora este mensaje.</p>
  </div>
</body></html>`;
}
