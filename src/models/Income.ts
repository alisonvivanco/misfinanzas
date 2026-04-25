import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IIncome extends Document {
  userId: Types.ObjectId;
  fuente: string;
  monto: number;
  mes: number; // 1-12
  anio: number;
  createdAt: Date;
  updatedAt: Date;
}

const IncomeSchema = new Schema<IIncome>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fuente: { type: String, required: true, trim: true },
    monto: { type: Number, required: true, min: 0 },
    mes: { type: Number, required: true, min: 1, max: 12 },
    anio: { type: Number, required: true },
  },
  { timestamps: true }
);

IncomeSchema.index({ userId: 1, anio: 1, mes: 1 });

export const Income: Model<IIncome> =
  mongoose.models.Income || mongoose.model<IIncome>("Income", IncomeSchema);
