#!/bin/bash
cd "$(dirname "$0")"

echo "🔧 Preparando commit de fix..."

# Si el .git se perdió (porque alguien corrió push-a-github.command), re-inicializar y conectar con remote
if [ ! -d .git ]; then
  echo "📦 .git no existe. Clonando sobre los cambios locales..."
  # Guardar trabajo actual
  TMPDIR=$(mktemp -d)
  cp -a . "$TMPDIR/" 2>/dev/null

  # Re-init y fetch remoto
  git init -b main
  git config user.email "alison.vivanco.p@gmail.com"
  git config user.name "Alison Vivanco"
  git remote add origin https://github.com/alisonvivanco/misfinanzas.git
  git fetch origin main
  git reset --mixed origin/main
  echo "✅ Repo reconectado con el estado remoto"
fi

# Asegurar remote correcto
if ! git remote | grep -q '^origin$'; then
  git remote add origin https://github.com/alisonvivanco/misfinanzas.git
fi

echo "📝 Staging cambios..."
git add -A

if git diff --cached --quiet; then
  echo "⚠️  No hay cambios para commitear."
else
  echo "💾 Creando commit..."
  git commit -m "fix: split Auth.js config for Edge Runtime compatibility

- Add auth.config.ts (edge-safe, no Mongoose)
- Move MongoDB adapter + bcryptjs to auth.ts (Node runtime only)
- Update middleware.ts to use minimal authConfig
- Add serverExternalPackages in next.config.js for mongoose/mongodb"
fi

echo "⬆️  Push a GitHub..."
if git push origin main; then
  echo ""
  echo "✅ LISTO. Vercel redeployará automáticamente al detectar push."
  echo "   Revisa: https://vercel.com/alisonvivanco/misfinanzas"
else
  echo ""
  echo "❌ Push falló. Ejecuta manualmente:"
  echo "   gh auth status"
  echo "   git push origin main"
fi

echo ""
read -n 1 -s -r -p "Presiona cualquier tecla para cerrar..."
