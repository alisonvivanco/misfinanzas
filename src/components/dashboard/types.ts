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

export interface SavingContribution {
  _id: string;
  fecha: string;
  monto: number;
  notas?: string;
}

export interface Saving {
  _id: string;
  descripcion: string;
  meta: number;
  montoAhorrado: number;
  contribuciones: SavingContribution[];
  fechaMeta?: string;
}

export interface DebtPayment {
  _id: string;
  fecha: string;
  monto: number;
  cuotaNumero?: number;
  notas?: string;
}

export interface Debt {
  _id: string;
  descripcion: string;
  monto: number;
  pagado: number;
  pagos: DebtPayment[];
  cuotasTotales?: number;
  cuotasSaltadas?: number[];
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
