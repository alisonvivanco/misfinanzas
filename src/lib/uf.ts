/**
 * Fetch UF/UTM desde mindicador.cl (API pública gratuita)
 */

export interface IndicadorCL {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

const BASE = process.env.MINDICADOR_API_URL || "https://mindicador.cl/api";

export async function getUFActual(): Promise<number> {
  try {
    const res = await fetch(`${BASE}/uf`, {
      next: { revalidate: 3600 }, // cache 1 hora
    });
    if (!res.ok) throw new Error("UF fetch failed");
    const data = await res.json();
    return data?.serie?.[0]?.valor || 39500;
  } catch {
    return 39500; // fallback
  }
}

export async function getUTMActual(): Promise<number> {
  try {
    const res = await fetch(`${BASE}/utm`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error("UTM fetch failed");
    const data = await res.json();
    return data?.serie?.[0]?.valor || 68000;
  } catch {
    return 68000;
  }
}

export async function getIndicadores() {
  const [uf, utm, dolar] = await Promise.all([
    getUFActual(),
    getUTMActual(),
    fetch(`${BASE}/dolar`, { next: { revalidate: 3600 } })
      .then((r) => r.json())
      .then((d) => d?.serie?.[0]?.valor || 950)
      .catch(() => 950),
  ]);
  return { uf, utm, dolar };
}
