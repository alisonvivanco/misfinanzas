import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBoleta extends Document {
  userId: Types.ObjectId;
  numeroBoleta?: string;
  fechaEmision: Date;
  cliente: string;
  rutCliente?: string;
  descripcion: string;
  montoBruto: number;
  porcentajeRetencion: number;
  montoRetencion: number;
  montoLiquido: number;
  estado: "emitida" | "pagada" | "pendiente" | "anulada";
  fechaPago?: Date;
  metodoPago?: "transferencia" | "efectivo" | "cheque" | "otro";
  mes: number; // 1-12
  anio: number;
  notas?: string;
  provisionOpRenta: boolean;
  archivoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BoletaSchema = new Schema<IBoleta>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    numeroBoleta: { type: String, trim: true },
    fechaEmision: { type: Date, required: true, index: true },
    cliente: { type: String, required: true, trim: true },
    rutCliente: { type: String, trim: true },
    descripcion: { type: String, required: true, trim: true },
    montoBruto: { type: Number, required: true, min: 0 },
    porcentajeRetencion: { type: Number, required: true, default: 0.1525 },
    montoRetencion: { type: Number, required: true },
    montoLiquido: { type: Number, required: true },
    estado: {
      type: String,
      enum: ["emitida", "pagada", "pendiente", "anulada"],
      default: "emitida",
    },
    fechaPago: { type: Date },
    metodoPago: {
      type: String,
      enum: ["transferencia", "efectivo", "cheque", "otro"],
    },
    mes: { type: Number, required: true, min: 1, max: 12, index: true },
    anio: { type: Number, required: true, index: true },
    notas: { type: String },
    provisionOpRenta: { type: Boolean, default: true },
    archivoUrl: { type: String },
  },
  { timestamps: true }
);

BoletaSchema.index({ userId: 1, anio: 1, mes: 1 });
BoletaSchema.index({ userId: 1, fechaEmision: -1 });

// Hook: calcular retención y líquido antes de guardar
BoletaSchema.pre("save", function (next) {
  this.montoRetencion = Math.round(this.montoBruto * this.porcentajeRetencion);
  this.montoLiquido = this.montoBruto - this.montoRetencion;
  const fecha = this.fechaEmision;
  this.mes = fecha.getMonth() + 1;
  this.anio = fecha.getFullYear();
  next();
});

export const Boleta: Model<IBoleta> =
  mongoose.models.Boleta || mongoose.model<IBoleta>("Boleta", BoletaSchema);
