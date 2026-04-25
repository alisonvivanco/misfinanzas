import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type Bucket503020 = "necesidades" | "deseos" | "ahorros";

/**
 * Gasto variable mensual (fila de la tabla "CATEGORÍA" del Excel).
 * El bucket 50/30/20 se guarda por fila para máxima flexibilidad.
 */
export interface IExpense extends Document {
  userId: Types.ObjectId;
  categoria: string; // "Mercado", "Transporte", etc.
  monto: number;
  tipo: Bucket503020;
  fecha?: Date;
  mes: number;
  anio: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    categoria: { type: String, required: true, trim: true },
    monto: { type: Number, required: true, min: 0 },
    tipo: {
      type: String,
      enum: ["necesidades", "deseos", "ahorros"],
      required: true,
    },
    fecha: { type: Date },
    mes: { type: Number, required: true, min: 1, max: 12 },
    anio: { type: Number, required: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ userId: 1, anio: 1, mes: 1 });

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
