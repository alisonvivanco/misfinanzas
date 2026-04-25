import { Resend } from "resend";
import { SUBSCRIBE_URL } from "@/lib/subscription";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM || "MisFinanzas <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// =====================================================================
// Verification — link para verificar el email tras registrarse
// =====================================================================

export async function sendVerificationEmail(email: string, nombre: string, token: string) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurado, skipping email");
    console.log(`[email:dev] Verify URL: ${APP_URL}/verify?token=${token}`);
    return { success: true, id: "dev-skip" };
  }
  const url = `${APP_URL}/verify?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verifica tu email · MisFinanzas",
    html: emailShell({
      nombre,
      title: "Verifica tu email",
      preheader: "Activa tu cuenta de MisFinanzas",
      body: `
        <p>Bienvenido a MisFinanzas. Para activar tu cuenta y empezar a controlar tus finanzas, verifica tu correo:</p>
        ${ctaButton(url, "Verificar email")}
        <p class="muted small">O copia este link:<br><span class="link">${url}</span></p>
        <p class="muted small">Este link expira en 24 horas.</p>
      `,
    }),
  });
}

// =====================================================================
// Welcome — primer correo después de verificar (o tras OAuth)
// =====================================================================

export async function sendWelcomeEmail(email: string, nombre: string) {
  if (!resend) {
    console.log(`[email:dev] Welcome ${email}`);
    return { success: true, id: "dev-skip" };
  }
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "¡Bienvenido a MisFinanzas! 🎉",
    html: emailShell({
      nombre,
      title: "Tu plata, bajo control",
      preheader: "Empezamos juntos a ordenar tus finanzas",
      body: `
        <p>Tu cuenta está activa. Tienes <strong>1 día de prueba gratis</strong> para registrar tus ingresos, gastos, deudas y ahorros.</p>
        <p>Esto es lo que puedes hacer hoy mismo:</p>
        <ul>
          <li>Registrar todos tus ingresos del mes</li>
          <li>Anotar gastos fijos (arriendo, internet, suscripciones)</li>
          <li>Ver tu regla 50/30/20 calculada automáticamente</li>
          <li>Crear metas de ahorro y abonarles a lo largo del tiempo</li>
          <li>Llevar el control de tus deudas cuota por cuota</li>
        </ul>
        ${ctaButton(`${APP_URL}/dashboard`, "Ir al dashboard")}
        <p class="muted small">Si tienes dudas, responde este correo y te ayudamos.</p>
      `,
    }),
  });
}

// =====================================================================
// Trial reminder — 12h antes de que expire la prueba
// =====================================================================

export async function sendTrialReminderEmail(email: string, nombre: string, userId: string) {
  if (!resend) {
    console.log(`[email:dev] Trial reminder ${email}`);
    return { success: true, id: "dev-skip" };
  }
  const sub = SUBSCRIBE_URL.includes("?")
    ? `${SUBSCRIBE_URL}&external_reference=${encodeURIComponent(userId)}`
    : `${SUBSCRIBE_URL}?external_reference=${encodeURIComponent(userId)}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Tu prueba está por terminar · MisFinanzas",
    html: emailShell({
      nombre,
      title: "Tu prueba termina pronto",
      preheader: "Suscríbete y mantén todo lo que registraste",
      body: `
        <p>Tu prueba gratis de MisFinanzas <strong>termina dentro de las próximas 24 horas</strong>. Para no perder lo que ya registraste, suscríbete por menos que un café al mes:</p>
        ${ctaButton(sub, "Suscribirme con MercadoPago")}
        <p class="muted small">Tus datos quedan guardados — al volver, todo lo que registraste sigue ahí.</p>
        <p class="muted small">¿Tienes dudas? Responde este correo.</p>
      `,
    }),
  });
}

// =====================================================================
// Reset — link para restablecer contraseña
// =====================================================================

export async function sendResetEmail(email: string, nombre: string, token: string) {
  if (!resend) {
    console.log(`[email:dev] Reset URL: ${APP_URL}/reset?token=${token}`);
    return { success: true, id: "dev-skip" };
  }
  const url = `${APP_URL}/reset?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Restablece tu contraseña · MisFinanzas",
    html: emailShell({
      nombre,
      title: "Restablecer contraseña",
      preheader: "Crea una contraseña nueva",
      body: `
        <p>Recibimos tu solicitud para restablecer la contraseña de tu cuenta. Haz click para crear una nueva:</p>
        ${ctaButton(url, "Crear nueva contraseña")}
        <p class="muted small">Este link expira en 1 hora. Si no fuiste tú, ignora este mensaje.</p>
      `,
    }),
  });
}

// =====================================================================
// Shared HTML shell — paleta + tipografía consistente con la app
// =====================================================================

function ctaButton(href: string, label: string) {
  return `
    <div style="text-align:center;margin:32px 0;">
      <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6,#c026d3);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
        ${label}
      </a>
    </div>
  `;
}

function emailShell({
  nombre, title, preheader, body,
}: { nombre: string; title: string; preheader: string; body: string }) {
  const greeting = nombre ? `Hola ${nombre},` : "Hola,";
  return `<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>
    .muted { color:#6b7280; }
    .small { font-size:13px; line-height:1.5; }
    .link { color:#2563eb; word-break:break-all; }
    body { margin:0; padding:0; background:#f4f6fa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; color:#1f2937; }
    a { color: inherit; }
    ul { padding-left:18px; }
    li { margin: 4px 0; line-height: 1.6; }
    p { line-height:1.6; }
  </style>
</head>
<body>
  <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 24px rgba(0,0,0,0.06);">
        <tr><td style="padding:32px 40px 0;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:8px;">
            <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#3b82f6,#8b5cf6,#c026d3);"></div>
            <span style="font-size:16px;font-weight:700;color:#111827;letter-spacing:-0.01em;">AlisonVivanco<span style="background:linear-gradient(135deg,#3b82f6,#c026d3);-webkit-background-clip:text;background-clip:text;color:transparent;">.cl</span></span>
          </div>
        </td></tr>
        <tr><td style="padding:24px 40px 32px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#111827;letter-spacing:-0.01em;">${greeting}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:18px 40px;background:#f4f6fa;text-align:center;font-size:11px;color:#9ca3af;line-height:1.5;">
          MisFinanzas · misfinanzas.alisonvivanco.cl<br>
          Si no esperabas este mensaje, ignóralo.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
