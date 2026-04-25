import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Donación (fila de "DONACIONES SE CONSIDERA GASTO" del Excel).
 * Se cuenta como gasto en el comparativo Presupuesto vs Actual.
 */
export interface IDonation extends Document {
  userId: Types.ObjectId;
  descripcion: string;
  monto: number;
  fecha?: Date;
  mes: number;
  anio: number;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    descripcion: { type: String, required: true, trim: true },
    monto: { type: Number, required: true, min: 0 },
    fecha: { type: Date },
    mes: { type: Number, required: true, min: 1, max: 12 },
    anio: { type: Number, required: true },
  },
  { timestamps: true }
);

DonationSchema.index({ userId: 1, anio: 1, mes: 1 });

export const Donation: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema);
