import mongoose, { Schema, Document, Model, Types } from "mongoose";

/**
 * Meta de ahorro (fila de "AHORROS" del Excel).
 * Tracking simple: meta + monto ahorrado actual.
 */
export interface ISaving extends Document {
  userId: Types.ObjectId;
  descripcion: string; // "Vacaciones", "Emergencia"
  meta: number;
  montoAhorrado: number;
  fechaMeta?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SavingSchema = new Schema<ISaving>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    descripcion: { type: String, required: true, trim: true },
    meta: { type: Number, required: true, min: 0 },
    montoAhorrado: { type: Number, default: 0, min: 0 },
    fechaMeta: { type: Date },
  },
  { timestamps: true }
);

export const Saving: Model<ISaving> =
  mongoose.models.Saving || mongoose.model<ISaving>("Saving", SavingSchema);
