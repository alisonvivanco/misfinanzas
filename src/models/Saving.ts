import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISavingContribution {
  _id?: Types.ObjectId;
  fecha: Date;
  monto: number;
  notas?: string;
  createdAt?: Date;
}

/**
 * Meta de ahorro con historial de aportes.
 * `montoAhorrado` es denormalizado (suma de contribuciones) — la API lo
 * recalcula cada vez que se agrega o elimina un aporte.
 */
export interface ISaving extends Document {
  userId: Types.ObjectId;
  descripcion: string;
  meta: number;
  montoAhorrado: number;
  contribuciones: ISavingContribution[];
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
    contribuciones: [
      {
        fecha: { type: Date, required: true },
        monto: { type: Number, required: true, min: 0 },
        notas: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    fechaMeta: { type: Date },
  },
  { timestamps: true }
);

export const Saving: Model<ISaving> =
  mongoose.models.Saving || mongoose.model<ISaving>("Saving", SavingSchema);
