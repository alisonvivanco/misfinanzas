import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type TransactionType = "ingreso" | "gasto" | "ahorro" | "inversion" | "deuda";
export type TransactionRule = "necesidades" | "deseos" | "ahorros";

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  tipo: TransactionType;
  categoria: string;
  tipoRegla?: TransactionRule; // Solo para gastos
  descripcion: string;
  monto: number;
  moneda: "CLP" | "USD" | "UF";
  fecha: Date;
  metodoPago?: "efectivo" | "debito" | "credito" | "transferencia" | "otro";
  recurrente: boolean;
  frecuencia?: "mensual" | "semanal" | "anual";
  etiquetas: string[];
  esPresupuestado: boolean;
  presupuesto?: number;
  mes: number;
  anio: number;
  completado: boolean;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      enum: ["ingreso", "gasto", "ahorro", "inversion", "deuda"],
      required: true,
      index: true,
    },
    categoria: { type: String, required: true, trim: true },
    tipoRegla: {
      type: String,
      enum: ["necesidades", "deseos", "ahorros"],
    },
    descripcion: { type: String, required: true, trim: true },
    monto: { type: Number, required: true },
    moneda: { type: String, enum: ["CLP", "USD", "UF"], default: "CLP" },
    fecha: { type: Date, required: true, index: true },
    metodoPago: {
      type: String,
      enum: ["efectivo", "debito", "credito", "transferencia", "otro"],
    },
    recurrente: { type: Boolean, default: false },
    frecuencia: { type: String, enum: ["mensual", "semanal", "anual"] },
    etiquetas: [{ type: String, trim: true }],
    esPresupuestado: { type: Boolean, default: false },
    presupuesto: { type: Number },
    mes: { type: Number, required: true, min: 1, max: 12 },
    anio: { type: Number, required: true },
    completado: { type: Boolean, default: true },
    notas: { type: String },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, anio: 1, mes: 1, tipo: 1 });
TransactionSchema.index({ userId: 1, fecha: -1 });

TransactionSchema.pre("save", function (next) {
  const f = this.fecha;
  this.mes = f.getMonth() + 1;
  this.anio = f.getFullYear();
  next();
});

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);
