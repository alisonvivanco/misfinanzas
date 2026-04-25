import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Gasto puntual del usuario. Equivalente a una fila en la tabla
 * "Categoría / Gastos Variables" de la planilla mensual.
 *
 * El tipo 50/30/20 NO se almacena: se resuelve dinámicamente desde
 * `lib/categorias.ts` + override del usuario en `User.configuracion.categoriasOverride`.
 * Esto permite reasignar buckets sin tocar miles de filas.
 */
export interface IExpense extends Document {
  userId: Types.ObjectId;
  categoria: string;
  descripcion?: string;
  monto: number;
  fecha: Date;
  metodoPago?: "efectivo" | "debito" | "credito" | "transferencia" | "otro";
  // Si el gasto vino de una factura recurrente, guardamos el id para evitar duplicados.
  recurringExpenseId?: Types.ObjectId;
  mes: number; // 1-12
  anio: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    categoria: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    monto: { type: Number, required: true, min: 0 },
    fecha: { type: Date, required: true, index: true },
    metodoPago: {
      type: String,
      enum: ["efectivo", "debito", "credito", "transferencia", "otro"],
    },
    recurringExpenseId: { type: Schema.Types.ObjectId, ref: "RecurringExpense" },
    mes: { type: Number, required: true, min: 1, max: 12 },
    anio: { type: Number, required: true },
    notas: { type: String, trim: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ userId: 1, anio: 1, mes: 1 });
ExpenseSchema.index({ userId: 1, fecha: -1 });

ExpenseSchema.pre("validate", function (next) {
  if (this.fecha) {
    this.mes = this.fecha.getMonth() + 1;
    this.anio = this.fecha.getFullYear();
  }
  next();
});

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
