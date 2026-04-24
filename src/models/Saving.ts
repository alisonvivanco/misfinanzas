import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISavingContribution {
  fecha: Date;
  monto: number;
  notas?: string;
}

export interface ISaving extends Document {
  userId: Types.ObjectId;
  nombre: string;
  descripcion?: string;
  metaMonto: number;
  metaUF?: number;
  montoActual: number;
  montoInicial: number;
  contribucionMensual: number;
  fechaInicio: Date;
  fechaMeta?: Date;
  prioridad: "alta" | "media" | "baja";
  categoria: "emergencia" | "viaje" | "vivienda" | "educacion" | "auto" | "jubilacion" | "otro";
  contribuciones: ISavingContribution[];
  cumplida: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SavingSchema = new Schema<ISaving>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    metaMonto: { type: Number, required: true, min: 0 },
    metaUF: { type: Number },
    montoActual: { type: Number, default: 0 },
    montoInicial: { type: Number, default: 0 },
    contribucionMensual: { type: Number, default: 0 },
    fechaInicio: { type: Date, required: true },
    fechaMeta: { type: Date },
    prioridad: {
      type: String,
      enum: ["alta", "media", "baja"],
      default: "media",
    },
    categoria: {
      type: String,
      enum: [
        "emergencia",
        "viaje",
        "vivienda",
        "educacion",
        "auto",
        "jubilacion",
        "otro",
      ],
      default: "otro",
    },
    contribuciones: [
      {
        fecha: { type: Date, required: true },
        monto: { type: Number, required: true },
        notas: String,
      },
    ],
    cumplida: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SavingSchema.index({ userId: 1, cumplida: 1 });

export const Saving: Model<ISaving> =
  mongoose.models.Saving || mongoose.model<ISaving>("Saving", SavingSchema);
