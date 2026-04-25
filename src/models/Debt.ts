import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDebtPayment {
  _id?: Types.ObjectId;
  fecha: Date;
  monto: number;
  /** 1-based cuota number this payment is targeted at. Optional. */
  cuotaNumero?: number;
  notas?: string;
  createdAt?: Date;
}

/**
 * Deuda con historial de abonos.
 * `pagado` es denormalizado (suma de pagos). La API lo recalcula al
 * agregar/quitar un pago. Cuando alcanza `monto`, marca `saldada: true`.
 */
export interface IDebt extends Document {
  userId: Types.ObjectId;
  descripcion: string;
  monto: number;
  pagado: number;
  pagos: IDebtPayment[];
  cuotasTotales?: number;
  /** 1-based cuota numbers explicitly marked as not paid / skipped. */
  cuotasSaltadas: number[];
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
    pagos: [
      {
        fecha: { type: Date, required: true },
        monto: { type: Number, required: true, min: 0 },
        cuotaNumero: { type: Number, min: 1 },
        notas: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    cuotasTotales: { type: Number, min: 1 },
    cuotasSaltadas: { type: [Number], default: [] },
    fechaVencimiento: { type: Date },
    saldada: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

DebtSchema.index({ userId: 1, saldada: 1 });

export const Debt: Model<IDebt> =
  mongoose.models.Debt || mongoose.model<IDebt>("Debt", DebtSchema);
