import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Donación — se modela aparte de Expense para reportes específicos
 * (un KPI dedicado en la vista mensual y anual). Igual cuenta como
 * gasto en el comparativo Presupuesto vs Actual; el bucket 50/30/20
 * se resuelve via `User.configuracion.donacionesBucket` (default "deseos").
 */
export interface IDonation extends Document {
  userId: Types.ObjectId;
  descripcion: string; // "Incendios forestales", "Cruz Roja", etc.
  beneficiario?: string;
  monto: number;
  fecha: Date;
  mes: number;
  anio: number;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    descripcion: { type: String, required: true, trim: true },
    beneficiario: { type: String, trim: true },
    monto: { type: Number, required: true, min: 0 },
    fecha: { type: Date, required: true, index: true },
    mes: { type: Number, required: true, min: 1, max: 12 },
    anio: { type: Number, required: true },
    notas: { type: String, trim: true },
  },
  { timestamps: true }
);

DonationSchema.index({ userId: 1, anio: 1, mes: 1 });

DonationSchema.pre("validate", function (next) {
  if (this.fecha) {
    this.mes = this.fecha.getMonth() + 1;
    this.anio = this.fecha.getFullYear();
  }
  next();
});

export const Donation: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema);
