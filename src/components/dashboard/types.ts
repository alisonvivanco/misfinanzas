export type Bucket = "necesidades" | "deseos" | "ahorros";

export interface Income {
  _id: string;
  fuente: string;
  monto: number;
  mes: number;
  anio: number;
}

export interface Expense {
  _id: string;
  categoria: string;
  monto: number;
  tipo: Bucket;
  fecha?: string;
  mes: number;
  anio: number;
}

export interface Recurring {
  _id: string;
  descripcion: string;
  monto: number;
  tipo: Bucket;
  diaPago?: number;
  activo: boolean;
}

export interface Saving {
  _id: string;
  descripcion: string;
  meta: number;
  montoAhorrado: number;
  fechaMeta?: string;
}

export interface Debt {
  _id: string;
  descripcion: string;
  monto: number;
  pagado: number;
  fechaVencimiento?: string;
  saldada: boolean;
}

export interface Donation {
  _id: string;
  descripcion: string;
  monto: number;
  fecha?: string;
  mes: number;
  anio: number;
}

export interface MonthData {
  incomes: Income[];
  expenses: Expense[];
  recurring: Recurring[];
  savings: Saving[];
  debts: Debt[];
  donations: Donation[];
}
