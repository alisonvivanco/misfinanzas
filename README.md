# MisFinanzas

**Tu contador personal digital — para Chile.**

SaaS de finanzas personales con boletas de honorarios, cotizaciones previsionales, regla 50/30/20, pago de deudas (Bola de Nieve), metas de ahorro e inversiones (APV, fondos, acciones, cripto).

Diseñado siguiendo estándares de auditor contable profesional y alineado con la legislación tributaria chilena (Ley 21.133, Ley 19.768, normativa SII vigente).

---

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **MongoDB Atlas** + Mongoose
- **Auth.js v5** (NextAuth) con verificación de email
- **Tailwind CSS** + shadcn/ui (Radix primitives)
- **Recharts** para visualizaciones
- **React Hook Form** + **Zod**
- **Resend** para emails transaccionales
- **Vercel** para deploy

---

## Estructura

```
src/
├── app/
│   ├── (auth)/         # login, signup, verify, forgot
│   ├── (dashboard)/    # dashboard, boletas, cotizaciones, etc
│   ├── api/            # auth, signup, verify, boletas, ...
│   ├── layout.tsx
│   ├── page.tsx        # landing
│   └── globals.css
├── components/
│   ├── ui/             # Button, Input, Card, Label (shadcn style)
│   ├── dashboard/      # KPICard
│   ├── charts/         # Recharts wrappers
│   └── layout/         # Sidebar
├── lib/
│   ├── mongodb.ts      # conexión singleton
│   ├── auth.ts         # Auth.js config
│   ├── rut.ts          # validador RUT módulo 11
│   ├── chile-tax.ts    # retención, IU, cotizaciones, 50/30/20
│   ├── uf.ts           # UF/UTM desde mindicador.cl
│   ├── email.ts        # Resend templates
│   └── utils.ts        # cn, helpers
├── models/
│   ├── User.ts
│   ├── Boleta.ts
│   ├── Transaction.ts
│   ├── Budget.ts
│   ├── Debt.ts
│   ├── Saving.ts
│   ├── Investment.ts
│   └── Cotizacion.ts
├── types/
└── middleware.ts       # Auth middleware
```

---

## Setup local

```bash
# 1. Clonar
git clone <repo-url> misfinanzas
cd misfinanzas

# 2. Instalar deps
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Llenar:
#   MONGODB_URI      → Atlas (free tier disponible)
#   AUTH_SECRET      → openssl rand -base64 32
#   RESEND_API_KEY   → https://resend.com

# 4. Dev server
npm run dev
```

Visita `http://localhost:3000` — el signup crea una cuenta con 14 días de trial.

---

## Deploy a Vercel (subdominio misfinanzas.alisonvivanco.cl)

### 1. Crear cluster MongoDB Atlas

1. Registrarse en [mongodb.com/cloud](https://cloud.mongodb.com)
2. Crear cluster gratis (M0) en región São Paulo
3. Network Access → Allow Access from Anywhere (0.0.0.0/0)
4. Database Access → crear usuario con password fuerte
5. Connect → copiar connection string

### 2. Obtener API key Resend

1. Registrarse en [resend.com](https://resend.com)
2. Verificar dominio `alisonvivanco.cl` (añadir DNS records)
3. Crear API key con permiso de envío
4. Configurar `EMAIL_FROM="MisFinanzas <no-responder@misfinanzas.alisonvivanco.cl>"`

### 3. Deploy en Vercel

```bash
# Opción 1: CLI
vercel --prod

# Opción 2: GitHub
# - Push el código a github.com/alisonvivanco/misfinanzas
# - Import proyecto en vercel.com/new
# - Configurar env vars desde .env.example
```

### 4. Configurar subdominio

En tu DNS (Cloudflare / registrar de alisonvivanco.cl):

```
Tipo    Nombre          Valor
CNAME   misfinanzas     cname.vercel-dns.com
```

En Vercel → Project Settings → Domains → añadir `misfinanzas.alisonvivanco.cl`.

---

## Módulos funcionales

### 🧾 Boletas de Honorarios
Registro con cálculo automático de retención según año (Ley 21.133):
- 2026: 15,25%
- 2027: 17%
- 2028+: 17%

Provisión automática para Operación Renta.

### 🛡 Cotizaciones Previsionales
Cálculo mensual sobre base imponible del 80% del bruto (Ley 21.133):
- AFP: 10% + comisión (configurable)
- Salud: 7% Fonasa (Isapre variable)
- SIS: 1,54%
- Accidentes del Trabajo: 0,95%

### 📊 Presupuesto 50/30/20
Regla probada:
- **50% Necesidades** — Arriendo, servicios, mercado, transporte, salud
- **30% Deseos** — Entretenimiento, restaurantes, hobbies
- **20% Ahorros e Inversión** — Metas, APV, fondo emergencia

### 💳 Pago de Deudas (Bola de Nieve)
Ordena deudas de menor a mayor saldo. Paga mínimo en todas + extra en la más pequeña.

### 💰 Metas de Ahorro
- Conversión automática CLP ↔ UF
- Barra de progreso
- Cálculo de meses restantes según contribución mensual

### 📈 Inversiones
- APV (Régimen A / B — Ley 19.768)
- Fondos mutuos
- Acciones, ETF, Cripto
- Depósitos a plazo, Bonos
- Rentabilidad automática

---

## Tributación Chile — referencias

- **Ley 21.133** — Cotizaciones obligatorias para independientes
- **Ley 19.768** — APV (Ahorro Previsional Voluntario)
- **DL 824 / LIR** — Impuesto a la Renta
- **Tramos IU 2da Categoría** — Actualizar en `src/lib/chile-tax.ts` con valores SII

### Integración futura con SII vía Clave Única

Roadmap:
- OAuth con Clave Única del Estado
- Sync automático de boletas emitidas
- Propuesta pre-llenada de Operación Renta
- Descarga de certificados de retención

---

## Comandos

```bash
npm run dev          # Dev server
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # ESLint
npm run typecheck    # Type-check TypeScript
```

---

## Seguridad

- Contraseñas con bcrypt cost 12
- Email verification obligatoria
- JWT sessions 30 días
- Middleware auth en todas las rutas privadas
- Headers de seguridad (X-Frame-Options, CSP, etc)
- RUT validado con algoritmo Módulo 11 oficial

---

## Licencia

MIT © Alison Vivanco
