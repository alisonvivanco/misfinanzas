import type { Bucket503020 } from "@/models/Expense";

export const CATEGORIAS_GASTO = [
  "Mercado",
  "Transporte",
  "Restaurante",
  "Entretenimiento",
  "Salud",
  "Cuidado personal",
  "Hogar",
  "Ropa",
  "Educación",
  "Vacaciones",
  "Mascotas",
  "Regalos",
  "Misceláneos",
  "Combustible",
  "Suscripciones",
] as const;

export type CategoriaGasto = (typeof CATEGORIAS_GASTO)[number];

/** Default 50/30/20 bucket sugerido al crear una categoría. */
export const CATEGORIA_TIPO_DEFAULT: Record<CategoriaGasto, Bucket503020> = {
  Mercado: "necesidades",
  Transporte: "necesidades",
  Salud: "necesidades",
  Educación: "necesidades",
  Hogar: "necesidades",
  Combustible: "necesidades",
  Restaurante: "deseos",
  Entretenimiento: "deseos",
  "Cuidado personal": "deseos",
  Ropa: "deseos",
  Vacaciones: "deseos",
  Mascotas: "deseos",
  Regalos: "deseos",
  Misceláneos: "deseos",
  Suscripciones: "deseos",
};

export const TIPO_LABEL: Record<Bucket503020, string> = {
  necesidades: "Necesidades",
  deseos: "Deseos",
  ahorros: "Ahorros",
};

export const TIPO_COLOR: Record<Bucket503020, string> = {
  necesidades: "#3b82f6",
  deseos: "#ef4444",
  ahorros: "#22c55e",
};

export const TIPO_PCT: Record<Bucket503020, number> = {
  necesidades: 0.5,
  deseos: 0.3,
  ahorros: 0.2,
};
