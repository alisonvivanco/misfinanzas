import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Factura / Gasto Fijo recurrente. Plantilla que se proyecta en cada
 * mes activo: arriendo, internet, Netflix, plan móvil, etc.
 *
 * No genera gastos automáticamente — la vista mensual los muestra
 * como "esperados" hasta que el usuario marca "pagado", que materializa
 * un Expense con `recurringExpenseId` para evitar dobles cargos.
 */
export interface IRecurringExpense extends Document {
  userId: Types.ObjectId;
  descripcion: string;
  categoria: string;
  monto: number;
  diaDelMes: number; // 1-31, día estimado de cobro
  fechaInicio: Date;
  fechaFin?: Date;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringExpenseSchema = new Schema<IRecurringExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    descripcion: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    monto: { type: Number, required: true, min: 0 },
    diaDelMes: { type: Number, required: true, min: 1, max: 31 },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date },
    activo: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

RecurringExpenseSchema.index({ userId: 1, activo: 1 });

export const RecurringExpense: Model<IRecurringExpense> =
  mongoose.models.RecurringExpense ||
  mongoose.model<IRecurringExpense>("RecurringExpense", RecurringExpenseSchema);
