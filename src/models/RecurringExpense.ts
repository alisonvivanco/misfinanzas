import mongoose, { Schema, Document, Model, Types } from "mongoose";
import type { Bucket503020 } from "./Expense";

/**
 * Gasto fijo mensual (fila de "FACTURAS / GASTOS FIJOS" del Excel).
 * Es una plantilla — se proyecta automáticamente en cada mes
 * mientras `activo` sea true. El usuario puede pisar el monto
 * para un mes puntual via Expense (variable).
 */
export interface IRecurringExpense extends Document {
  userId: Types.ObjectId;
  descripcion: string; // "Arriendo", "Internet", "Netflix"
  monto: number;
  tipo: Bucket503020;
  diaPago?: number; // 1-31, opcional (para mostrar fecha)
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringExpenseSchema = new Schema<IRecurringExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    descripcion: { type: String, required: true, trim: true },
    monto: { type: Number, required: true, min: 0 },
    tipo: {
      type: String,
      enum: ["necesidades", "deseos", "ahorros"],
      required: true,
    },
    diaPago: { type: Number, min: 1, max: 31 },
    activo: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

RecurringExpenseSchema.index({ userId: 1, activo: 1 });

export const RecurringExpense: Model<IRecurringExpense> =
  mongoose.models.RecurringExpense ||
  mongoose.model<IRecurringExpense>("RecurringExpense", RecurringExpenseSchema);
