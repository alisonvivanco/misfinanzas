import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IDebtPayment {
  fecha: Date;
  monto: number;
  notas?: string;
}

export interface IDebt extends Document {
  userId: Types.ObjectId;
  nombre: string;
  institucion?: string;
  tipo: "tarjeta_credito" | "credito_consumo" | "credito_hipotecario" | "credito_automotriz" | "linea_credito" | "otro";
  montoInicial: number;
  saldoActual: number;
  tasaInteresAnual: number;
  pagoMinimoMensual: number;
  fechaInicio: Date;
  fechaVencimiento?: Date;
  cuotasTotales?: number;
  cuotasPagadas: number;
  pagos: IDebtPayment[];
  estrategia: "bola_nieve" | "avalancha" | "proporcional";
  prioridad: number;
  saldada: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DebtSchema = new Schema<IDebt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nombre: { type: String, required: true, trim: true },
    institucion: { type: String, trim: true },
    tipo: {
      type: String,
      enum: [
        "tarjeta_credito",
        "credito_consumo",
        "credito_hipotecario",
        "credito_automotriz",
        "linea_credito",
        "otro",
      ],
      default: "otro",
    },
    montoInicial: { type: Number, required: true, min: 0 },
    saldoActual: { type: Number, required: true, min: 0 },
    tasaInteresAnual: { type: Number, default: 0 },
    pagoMinimoMensual: { type: Number, required: true },
    fechaInicio: { type: Date, required: true },
    fechaVencimiento: { type: Date },
    cuotasTotales: { type: Number },
    cuotasPagadas: { type: Number, default: 0 },
    pagos: [
      {
        fecha: { type: Date, required: true },
        monto: { type: Number, required: true },
        notas: String,
      },
    ],
    estrategia: {
      type: String,
      enum: ["bola_nieve", "avalancha", "proporcional"],
      default: "bola_nieve",
    },
    prioridad: { type: Number, default: 0 },
    saldada: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DebtSchema.index({ userId: 1, saldada: 1 });

export const Debt: Model<IDebt> =
  mongoose.models.Debt || mongoose.model<IDebt>("Debt", DebtSchema);
