/**
 * Categorías de gasto y su mapeo a la regla 50/30/20.
 * Replica la tabla de "CATEGORÍAS DE GASTO" de la planilla original.
 *
 * El mapeo default vive aquí, pero el usuario puede sobrescribirlo
 * desde /configuracion (campo `configuracion.categoriasOverride`).
 */

export type Tipo50_30_20 = "necesidades" | "deseos" | "ahorros";

/** Lista canónica de categorías de gasto. Orden = orden de display. */
export const CATEGORIAS_GASTO = [
  "Arriendo",
  "Servicios básicos",
  "Mercado",
  "Transporte",
  "Combustible",
  "Salud",
  "Educación",
  "Hogar",
  "Restaurante",
  "Entretenimiento",
  "Ropa",
  "Cuidado personal",
  "Vacaciones",
  "Mascotas",
  "Regalos",
  "Suscripciones",
  "Donaciones",
  "Misceláneos",
] as const;

export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];

/** Mapeo default categoría → tipo 50/30/20. */
export const CATEGORIA_TIPO_DEFAULT: Record<CategoriaGasto, Tipo50_30_20> = {
  Arriendo: "necesidades",
  "Servicios básicos": "necesidades",
  Mercado: "necesidades",
  Transporte: "necesidades",
  Combustible: "necesidades",
  Salud: "necesidades",
  Educación: "necesidades",
  Hogar: "necesidades",
  Restaurante: "deseos",
  Entretenimiento: "deseos",
  Ropa: "deseos",
  "Cuidado personal": "deseos",
  Vacaciones: "deseos",
  Mascotas: "deseos",
  Regalos: "deseos",
  Suscripciones: "deseos",
  Donaciones: "deseos", // overridable por usuario
  Misceláneos: "deseos",
};

/** Resuelve el tipo 50/30/20 de una categoría considerando overrides del usuario. */
export function resolveTipo50_30_20(
  categoria: string,
  overrides?: Partial<Record<string, Tipo50_30_20>> | null,
  donacionesBucket?: Tipo50_30_20
): Tipo50_30_20 {
  if (categoria === "Donaciones" && donacionesBucket) return donacionesBucket;
  if (overrides && overrides[categoria]) return overrides[categoria]!;
  if (categoria in CATEGORIA_TIPO_DEFAULT) {
    return CATEGORIA_TIPO_DEFAULT[categoria as CategoriaGasto];
  }
  return "deseos";
}

/** Etiqueta humana del tipo 50/30/20. */
export const TIPO_LABEL: Record<Tipo50_30_20, string> = {
  necesidades: "Necesidades",
  deseos: "Deseos",
  ahorros: "Ahorros",
};

/** Color tag por tipo 50/30/20 (alineado con paleta del dashboard). */
export const TIPO_COLOR: Record<Tipo50_30_20, string> = {
  necesidades: "#0ea5e9",
  deseos: "#a855f7",
  ahorros: "#22c55e",
};

/** Porcentaje recomendado por tipo. */
export const TIPO_PCT: Record<Tipo50_30_20, number> = {
  necesidades: 0.5,
  deseos: 0.3,
  ahorros: 0.2,
};

/** Métodos de pago soportados (igual a la planilla). */
export const METODOS_PAGO = ["efectivo", "debito", "credito", "transferencia", "otro"] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  efectivo: "Efectivo",
  debito: "Débito",
  credito: "Crédito",
  transferencia: "Transferencia",
  otro: "Otro",
};
