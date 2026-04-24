#!/bin/bash
# ============================================================
# Push inicial de MisFinanzas a GitHub
# Repo: https://github.com/alisonvivanco/misfinanzas.git
# ============================================================
# Uso: bash push-a-github.sh
# Requiere: git configurado con acceso al repo (SSH o token HTTPS)

set -e

cd "$(dirname "$0")"

# Verificar que estamos en la carpeta correcta
if [ ! -f package.json ] || ! grep -q '"misfinanzas"' package.json; then
  echo "ERROR: ejecuta este script desde /Users/alisonvivanco/misfinanzas/"
  exit 1
fi

echo "==> Inicializando repo..."
git init -b main

echo "==> Configurando autor..."
git config user.email "alison.vivanco.p@gmail.com"
git config user.name "Alison Vivanco"

echo "==> Agregando archivos..."
git add -A

echo "==> Creando commit inicial..."
git commit -m "feat: initial MisFinanzas SaaS

- Next.js 15 + TypeScript + Tailwind + shadcn/ui
- MongoDB + Mongoose (8 modelos)
- Auth.js v5 con email verification (Resend)
- Validador RUT módulo 11 oficial
- Lógica tributaria Chile (Ley 21.133, IU 2da Categoría)
- UF/UTM dinámicos desde mindicador.cl
- Dashboard con KPIs y gráficos Recharts
- Módulos: Boletas, Cotizaciones, Presupuesto 50/30/20,
  Deudas (Bola de Nieve), Ahorros, Inversiones
- Deploy config para Vercel + subdominio"

echo "==> Configurando remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/alisonvivanco/misfinanzas.git

echo "==> Pushing..."
git push -u origin main

echo ""
echo "✅ Listo. Tu código está en https://github.com/alisonvivanco/misfinanzas"
echo ""
echo "Siguientes pasos:"
echo "  1. Visitar https://vercel.com/new → importar el repo"
echo "  2. Configurar env vars (ver .env.example y DEPLOY.md)"
echo "  3. Añadir dominio misfinanzas.alisonvivanco.cl"
