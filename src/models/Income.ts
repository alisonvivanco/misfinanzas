import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Ingreso del usuario distinto a una boleta de honorarios.
 *
 * - `sueldo`: lo que un dependiente recibe líquido en su cuenta. La app no
 *   recalcula impuesto único 2da categoría — el empleador ya lo retuvo.
 *   Si el usuario quiere ver el bruto + IU, los puede agregar como notas.
 * - `otro`: ingresos sin tributación (regalo, devolución, venta puntual).
 *
 * Las boletas de honorarios siguen viviendo en el modelo `Boleta` porque
 * tienen campos específicos del SII (retención, líquido, número de boleta).
 */
export type IncomeTipo = "sueldo" | "otro";

export interface IIncome extends Document {
  userId: Types.ObjectId;
  tipo: IncomeTipo;
  fuente: string; // "Empleador X", "Venta auto", "Devolución impuesto", etc.
  descripcion?: string;
  monto: number; // CLP, líquido (lo que entró a la cuenta)
  fecha: Date;
  mes: number;
  anio: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IIncome>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tipo: { type: String, enum: ["sueldo", "otro"], required: true },
    fuente: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    monto: { type: Number, required: true, min: 0 },
    fecha: { type: Date, required: true, index: true },
    mes: { type: Number, required: true, min: 1, max: 12 },
    anio: { type: Number, required: true },
    notas: { type: String, trim: true },
  },
  { timestamps: true }
);

IncomeSchema.index({ userId: 1, anio: 1, mes: 1 });

IncomeSchema.pre("validate", function (next) {
  if (this.fecha) {
    this.mes = this.fecha.getMonth() + 1;
    this.anio = this.fecha.getFullYear();
  }
  next();
});

export const Income: Model<IIncome> =
  mongoose.models.Income || mongoose.model<IIncome>("Income", IncomeSchema);
