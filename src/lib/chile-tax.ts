/**
 * Utilidades tributarias de Chile.
 * Retención honorarios, Impuesto Único 2da Categoría, cotizaciones previsionales.
 *
 * Fuentes: sii.cl, previred.com, Ley 21.133 (cotizaciones independientes).
 */

// ============================================
// Retención Honorarios (Ley 21.133)
// Calendario escalonado 2022-2028
// ============================================
export const RETENCION_HONORARIOS: Record<number, number> = {
  2022: 0.1075,
  2023: 0.115,
  2024: 0.1275,
  2025: 0.14,
  2026: 0.1525,
  2027: 0.17,
  2028: 0.17,
};

export function tasaRetencionHonorarios(anio: number): number {
  return RETENCION_HONORARIOS[anio] ?? 0.17;
}

export function calcularRetencionHonorarios(
  montoBruto: number,
  anio: number
): { retencion: number; liquido: number; tasa: number } {
  const tasa = tasaRetencionHonorarios(anio);
  const retencion = Math.round(montoBruto * tasa);
  const liquido = montoBruto - retencion;
  return { retencion, liquido, tasa };
}

// ============================================
// Tramos Impuesto Único 2da Categoría (mensual en UTM)
// Valores referenciales — confirmar en sii.cl al mes de cálculo
// ============================================
export const TRAMOS_IU = [
  { desde: 0, hasta: 13.5, factor: 0, rebaja: 0 },
  { desde: 13.5, hasta: 30, factor: 0.04, rebaja: 0.54 },
  { desde: 30, hasta: 50, factor: 0.08, rebaja: 1.74 },
  { desde: 50, hasta: 70, factor: 0.135, rebaja: 4.49 },
  { desde: 70, hasta: 90, factor: 0.23, rebaja: 11.14 },
  { desde: 90, hasta: 120, factor: 0.304, rebaja: 17.8 },
  { desde: 120, hasta: 310, factor: 0.35, rebaja: 23.32 },
  { desde: 310, hasta: Infinity, factor: 0.4, rebaja: 38.82 },
];

export function calcularImpuestoUnico(
  baseImponibleCLP: number,
  valorUTM: number
): { baseUTM: number; tramo: number; impuestoCLP: number; tasaEfectiva: number } {
  const baseUTM = baseImponibleCLP / valorUTM;
  const tramo = TRAMOS_IU.find((t) => baseUTM > t.desde && baseUTM <= t.hasta);
  if (!tramo || tramo.factor === 0) {
    return {
      baseUTM,
      tramo: TRAMOS_IU.findIndex((t) => baseUTM <= t.hasta) + 1,
      impuestoCLP: 0,
      tasaEfectiva: 0,
    };
  }
  const impuestoUTM = baseUTM * tramo.factor - tramo.rebaja;
  const impuestoCLP = Math.max(0, Math.round(impuestoUTM * valorUTM));
  const tasaEfectiva = baseImponibleCLP > 0 ? impuestoCLP / baseImponibleCLP : 0;
  return {
    baseUTM,
    tramo: TRAMOS_IU.indexOf(tramo) + 1,
    impuestoCLP,
    tasaEfectiva,
  };
}

// ============================================
// Cotizaciones previsionales (trabajador independiente)
// Ley 21.133: base imponible = 80% del bruto
// ============================================
export interface CotizacionParams {
  afp: number; // default 0.10
  comisionAFP: number; // default 0.0116
  salud: number; // 0.07 Fonasa, mayor en Isapre
  sis: number; // default 0.0154
  accidenteTrabajo: number; // default 0.0095
}

export const COTIZACION_DEFAULTS: CotizacionParams = {
  afp: 0.10,
  comisionAFP: 0.0116,
  salud: 0.07,
  sis: 0.0154,
  accidenteTrabajo: 0.0095,
};

export function calcularCotizaciones(
  brutoMensual: number,
  params: Partial<CotizacionParams> = {}
) {
  const p = { ...COTIZACION_DEFAULTS, ...params };
  const baseImponible = Math.round(brutoMensual * 0.8);
  const afp = Math.round(baseImponible * (p.afp + p.comisionAFP));
  const salud = Math.round(baseImponible * p.salud);
  const sis = Math.round(baseImponible * p.sis);
  const accidente = Math.round(baseImponible * p.accidenteTrabajo);
  const total = afp + salud + sis + accidente;
  return {
    baseImponible,
    afp,
    salud,
    sis,
    accidenteTrabajo: accidente,
    total,
    parametros: p,
  };
}

// ============================================
// Tope imponible mensual (UF)
// ============================================
export const TOPE_IMPONIBLE_UF = 87.8; // 2026, ajustar anualmente

export function topeImponibleCLP(valorUF: number): number {
  return Math.round(TOPE_IMPONIBLE_UF * valorUF);
}

// ============================================
// Regla 50/30/20
// ============================================
export function calcularRegla503020(ingresoTotal: number) {
  return {
    necesidades: Math.round(ingresoTotal * 0.5),
    deseos: Math.round(ingresoTotal * 0.3),
    ahorros: Math.round(ingresoTotal * 0.2),
  };
}

// ============================================
// Formato moneda CLP
// ============================================
export function formatCLP(monto: number | undefined | null): string {
  if (monto === undefined || monto === null || isNaN(Number(monto))) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(monto);
}

export function formatUF(monto: number): string {
  return `UF ${monto.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPct(pct: number): string {
  return `${(pct * 100).toFixed(1)}%`;
}

// ============================================
// Conversión CLP ↔ UF
// ============================================
export function clpAUf(montoCLP: number, valorUF: number): number {
  return valorUF > 0 ? montoCLP / valorUF : 0;
}

export function ufACLP(montoUF: number, valorUF: number): number {
  return Math.round(montoUF * valorUF);
}

// ============================================
// Provisión Operación Renta
// Estima cuánto debería provisionar del líquido
// ============================================
export function provisionOperacionRenta(
  brutoAnual: number,
  valorUTM: number,
  cotizacionesPagadas: number
): { impuestoEstimado: number; provisionRecomendada: number } {
  const mensual = brutoAnual / 12;
  const { impuestoCLP } = calcularImpuestoUnico(mensual * 0.8, valorUTM);
  const impuestoEstimadoAnual = impuestoCLP * 12;
  const provisionRecomendada = Math.max(0, impuestoEstimadoAnual - cotizacionesPagadas);
  return {
    impuestoEstimado: impuestoEstimadoAnual,
    provisionRecomendada,
  };
}
