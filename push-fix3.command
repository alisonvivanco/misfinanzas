#!/bin/bash
cd "$(dirname "$0")"
echo "💾 Fix 3: Suspense boundaries para useSearchParams..."
git add -A
git commit -m "fix: wrap useSearchParams pages in Suspense boundary

- login/page.tsx: Suspense wrapper around LoginForm
- verify/page.tsx: Suspense wrapper around VerifyContent"
echo ""
echo "⬆️  Pushing..."
git push origin main || git push --force origin main
echo ""
echo "✅ LISTO."
read -n 1 -s -r -p "Presiona cualquier tecla..."
