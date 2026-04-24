import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICotizacion extends Document {
  userId: Types.ObjectId;
  mes: number;
  anio: number;
  baseImponible: number; // 80% del bruto para independientes
  porcentajeAFP: number;
  comisionAFP: number;
  porcentajeSalud: number;
  porcentajeSIS: number;
  porcentajeAccidenteTrabajo: number;
  montoAFP: number;
  montoSalud: number;
  montoSIS: number;
  montoAccidenteTrabajo: number;
  totalCotizaciones: number;
  pagada: boolean;
  fechaPago?: Date;
  comprobanteUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CotizacionSchema = new Schema<ICotizacion>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mes: { type: Number, required: true, min: 1, max: 12 },
    anio: { type: Number, required: true },
    baseImponible: { type: Number, required: true },
    porcentajeAFP: { type: Number, default: 0.10 },
    comisionAFP: { type: Number, default: 0.0116 },
    porcentajeSalud: { type: Number, default: 0.07 },
    porcentajeSIS: { type: Number, default: 0.0154 },
    porcentajeAccidenteTrabajo: { type: Number, default: 0.0095 },
    montoAFP: { type: Number, default: 0 },
    montoSalud: { type: Number, default: 0 },
    montoSIS: { type: Number, default: 0 },
    montoAccidenteTrabajo: { type: Number, default: 0 },
    totalCotizaciones: { type: Number, default: 0 },
    pagada: { type: Boolean, default: false },
    fechaPago: { type: Date },
    comprobanteUrl: { type: String },
  },
  { timestamps: true }
);

CotizacionSchema.index({ userId: 1, anio: 1, mes: 1 }, { unique: true });

CotizacionSchema.pre("save", function (next) {
  const base = this.baseImponible;
  this.montoAFP = Math.round(base * (this.porcentajeAFP + this.comisionAFP));
  this.montoSalud = Math.round(base * this.porcentajeSalud);
  this.montoSIS = Math.round(base * this.porcentajeSIS);
  this.montoAccidenteTrabajo = Math.round(base * this.porcentajeAccidenteTrabajo);
  this.totalCotizaciones =
    this.montoAFP + this.montoSalud + this.montoSIS + this.montoAccidenteTrabajo;
  next();
});

export const Cotizacion: Model<ICotizacion> =
  mongoose.models.Cotizacion ||
  mongoose.model<ICotizacion>("Cotizacion", CotizacionSchema);
