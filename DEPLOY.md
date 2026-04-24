# Deploy a producción — misfinanzas.alisonvivanco.cl

Guía paso a paso para dejar la app funcionando en su subdominio.

## 1. GitHub

Dado que quieres integrarla a tu repositorio existente, tienes dos opciones:

### Opción A — Repo independiente (recomendada)
```bash
cd /Users/alisonvivanco/misfinanzas
git init
git add .
git commit -m "feat: initial MisFinanzas SaaS"
gh repo create alisonvivanco/misfinanzas --private --source=. --push
```

### Opción B — Como carpeta dentro de mypersonalpage
```bash
cd /Users/alisonvivanco/mypersonalpage
mkdir -p apps/misfinanzas
cp -r /Users/alisonvivanco/misfinanzas/* apps/misfinanzas/
git add apps/misfinanzas
git commit -m "feat: add misfinanzas SaaS"
git push
```

> Recomendación: **Opción A**. Un SaaS con auth, DB, subdominio y billing quiere su propio ciclo de deploy, su propio pipeline y sus propios secretos. Cruzarlo con un sitio estático trae problemas.

## 2. MongoDB Atlas

1. Ir a https://cloud.mongodb.com
2. **Create free cluster M0** — región São Paulo (latencia óptima para Chile)
3. **Network Access** → Add IP → `0.0.0.0/0` (o las IPs de Vercel)
4. **Database Access** → Add user con password aleatoria fuerte
5. **Connect** → copiar URI:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/misfinanzas
   ```

## 3. Resend (emails)

1. https://resend.com → registrarse
2. **Domains** → Add `alisonvivanco.cl` → configurar DNS records (SPF/DKIM)
3. **API Keys** → New key con scope Sending
4. Guardar la key

## 4. Vercel

### Deploy
1. https://vercel.com/new → Import `github.com/alisonvivanco/misfinanzas`
2. Framework: Next.js (auto-detectado)
3. Root Directory: `./` (o `apps/misfinanzas` si usaste Opción B)

### Variables de entorno
En Project Settings → Environment Variables, pega todo desde `.env.example`:

| Variable | Valor |
|----------|-------|
| `MONGODB_URI` | URI de Atlas (paso 2) |
| `MONGODB_DB` | `misfinanzas` |
| `AUTH_SECRET` | Ejecuta `openssl rand -base64 32` en terminal |
| `AUTH_URL` | `https://misfinanzas.alisonvivanco.cl` |
| `AUTH_TRUST_HOST` | `true` |
| `NEXT_PUBLIC_APP_URL` | `https://misfinanzas.alisonvivanco.cl` |
| `RESEND_API_KEY` | Key de Resend (paso 3) |
| `EMAIL_FROM` | `MisFinanzas <no-responder@misfinanzas.alisonvivanco.cl>` |
| `FREE_TRIAL_DAYS` | `14` |

### Dominio
1. Project → Settings → Domains → **Add** `misfinanzas.alisonvivanco.cl`
2. Vercel te mostrará los DNS records que debes agregar

### DNS en tu registrar (Cloudflare / NIC.cl)

```
Tipo    Nombre         Valor                    TTL
CNAME   misfinanzas    cname.vercel-dns.com     Auto
```

Si usas NIC.cl directo:
```
misfinanzas.alisonvivanco.cl.  CNAME  cname.vercel-dns.com.
```

Esperar propagación DNS (5-60 min) y verificar en Vercel.

## 5. Post-deploy: primer usuario

1. Visitar `https://misfinanzas.alisonvivanco.cl/signup`
2. Crear tu cuenta (ej: alison.vivanco.p@gmail.com)
3. Revisar email → click en link de verificación
4. Login → Dashboard

## 6. Tareas pendientes recomendadas

- [ ] Verificar dominio en Resend (obligatorio para emails reales)
- [ ] Crear página `/forgot` (recuperación de contraseña)
- [ ] Crear formularios para Deudas/Ahorros/Inversiones
- [ ] Integrar Webpay Plus (Transbank) para cobros
- [ ] Solicitar registro OAuth ante SII para Clave Única
- [ ] Añadir observabilidad (Sentry, Axiom, o Vercel Analytics)
- [ ] Backup automático de MongoDB (Atlas ofrece continuous backups en planes pagos)

## 7. Planes sugeridos (monetización)

| Plan | Precio CLP/mes | Límites |
|------|----------------|---------|
| **Trial** | Gratis 14 días | Todo habilitado |
| **Free** | $0 | 10 boletas/mes, sin export |
| **Premium** | $4.990 | Ilimitado + export PDF |
| **Pro** | $9.990 | Premium + integración SII + asesoría |

## 8. Monitoreo mínimo

Agregar en `src/app/api/health/route.ts`:
```ts
export async function GET() {
  await dbConnect();
  return Response.json({ ok: true, ts: Date.now() });
}
```

Agregar cron en Vercel o usar UptimeRobot apuntando a `/api/health`.
