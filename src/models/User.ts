import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  rut: string; // formato: "12345678-9"
  telefono: string;
  emailVerified: Date | null;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  tipoIngreso: "dependiente" | "honorarios" | "mixto" | "negocio";
  plan: "trial" | "free" | "premium" | "pro";
  trialEndsAt?: Date;
  subscribedUntil?: Date;
  configuracion: {
    monedaPreferida: string;
    retencionHonorarios: number;
    afpComision: number;
    planSalud: "fonasa" | "isapre";
    porcentajeSalud: number;
    valorUF?: number;
    valorUTM?: number;
  };
  stats: {
    totalBoletas: number;
    totalIngresado: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, select: false },
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    rut: { type: String, required: true, unique: true, index: true },
    telefono: { type: String, required: true },
    emailVerified: { type: Date, default: null },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    resetToken: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    tipoIngreso: {
      type: String,
      enum: ["dependiente", "honorarios", "mixto", "negocio"],
      default: "honorarios",
    },
    plan: {
      type: String,
      enum: ["trial", "free", "premium", "pro"],
      default: "trial",
    },
    trialEndsAt: { type: Date },
    subscribedUntil: { type: Date },
    configuracion: {
      monedaPreferida: { type: String, default: "CLP" },
      retencionHonorarios: { type: Number, default: 0.1525 },
      afpComision: { type: Number, default: 0.0116 },
      planSalud: { type: String, enum: ["fonasa", "isapre"], default: "fonasa" },
      porcentajeSalud: { type: Number, default: 0.07 },
      valorUF: { type: Number },
      valorUTM: { type: Number },
    },
    stats: {
      totalBoletas: { type: Number, default: 0 },
      totalIngresado: { type: Number, default: 0 },
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
