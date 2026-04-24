#!/bin/bash
cd "$(dirname "$0")"

echo "⚡ Force push (overwrite remote)..."
echo ""
git log --oneline -5 2>/dev/null
echo ""

echo "⬆️  git push --force origin main"
if git push --force origin main; then
  echo ""
  echo "✅ LISTO. GitHub actualizado con los fixes."
  echo "   Vercel redeployará automáticamente."
  echo "   Revisa: https://vercel.com/alisonvivanco/misfinanzas"
else
  echo ""
  echo "❌ Aún falla. Revisa:"
  echo "   gh auth status"
fi

echo ""
read -n 1 -s -r -p "Presiona cualquier tecla para cerrar..."
