import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IBudget extends Document {
  userId: Types.ObjectId;
  mes: number;
  anio: number;
  ingresoEsperado: number;
  regla503020: {
    necesidades: number; // monto
    deseos: number;
    ahorros: number;
  };
  porcentajes: {
    necesidades: number; // 0.5
    deseos: number;
    ahorros: number;
  };
  categorias: {
    nombre: string;
    tipoRegla: "necesidades" | "deseos" | "ahorros";
    montoAsignado: number;
  }[];
  cerrado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mes: { type: Number, required: true, min: 1, max: 12 },
    anio: { type: Number, required: true },
    ingresoEsperado: { type: Number, default: 0 },
    regla503020: {
      necesidades: { type: Number, default: 0 },
      deseos: { type: Number, default: 0 },
      ahorros: { type: Number, default: 0 },
    },
    porcentajes: {
      necesidades: { type: Number, default: 0.5 },
      deseos: { type: Number, default: 0.3 },
      ahorros: { type: Number, default: 0.2 },
    },
    categorias: [
      {
        nombre: { type: String, required: true, trim: true },
        tipoRegla: {
          type: String,
          enum: ["necesidades", "deseos", "ahorros"],
          required: true,
        },
        montoAsignado: { type: Number, required: true, min: 0 },
      },
    ],
    cerrado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, anio: 1, mes: 1 }, { unique: true });

export const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
