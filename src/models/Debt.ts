import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Deuda (fila de "PAGO DE DEUDA" del Excel).
 * Cuando `saldada` es true se renderiza con strikethrough en la UI.
 */
export interface IDebt extends Document {
  userId: Types.ObjectId;
  descripcion: string; // "Auto", "Celular nuevo"
  monto: number; // monto total de la deuda
  pagado: number; // monto ya pagado
  fechaVencimiento?: Date;
  saldada: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DebtSchema = new Schema<IDebt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    descripcion: { type: String, required: true, trim: true },
    monto: { type: Number, required: true, min: 0 },
    pagado: { type: Number, default: 0, min: 0 },
    fechaVencimiento: { type: Date },
    saldada: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

DebtSchema.index({ userId: 1, saldada: 1 });

export const Debt: Model<IDebt> =
  mongoose.models.Debt || mongoose.model<IDebt>("Debt", DebtSchema);
