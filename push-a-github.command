#!/bin/bash
cd "$(dirname "$0")"

echo ""
echo "🧹 Limpiando estado previo..."
# Mi intento anterior desde sandbox dejó un .git roto con index.lock. Partimos limpio.
rm -rf .git 2>/dev/null

echo "🚀 Publicando MisFinanzas a GitHub..."
echo ""

if [ ! -f package.json ] || ! grep -q '"misfinanzas"' package.json; then
  echo "❌ ERROR: debe ejecutarse dentro de ~/misfinanzas/"
  read -n 1 -s -r -p "Presiona cualquier tecla..."
  exit 1
fi

echo "📦 Inicializando repo git..."
git init -b main
git config user.email "alison.vivanco.p@gmail.com"
git config user.name "Alison Vivanco"

echo "📝 Agregando archivos..."
git add -A

echo "💾 Creando commit..."
git commit -m "feat: initial MisFinanzas SaaS

- Next.js 15 + TypeScript + Tailwind + shadcn/ui
- MongoDB + Mongoose (8 modelos)
- Auth.js v5 con email verification (Resend)
- Validador RUT modulo 11 oficial
- Logica tributaria Chile (Ley 21.133, IU 2da Categoria)
- UF/UTM dinamicos desde mindicador.cl
- Dashboard con KPIs y graficos Recharts
- Modulos: Boletas, Cotizaciones, Presupuesto 50/30/20,
  Deudas (Bola de Nieve), Ahorros, Inversiones
- Deploy config para Vercel + subdominio"

echo "🔗 Configurando remote..."
git remote add origin https://github.com/alisonvivanco/misfinanzas.git

echo ""
echo "⬆️  Pushing a github.com/alisonvivanco/misfinanzas..."
echo ""
if git push -u origin main; then
  echo ""
  echo "✅ LISTO. Tu código está en:"
  echo "   https://github.com/alisonvivanco/misfinanzas"
  echo ""
  echo "Siguiente: deploy a Vercel → https://vercel.com/new"
else
  echo ""
  echo "❌ Push falló. Verifica:"
  echo "   gh auth status"
  echo ""
  echo "Si gh no está autenticado:  gh auth login"
fi

echo ""
read -n 1 -s -r -p "Presiona cualquier tecla para cerrar..."
echo ""
