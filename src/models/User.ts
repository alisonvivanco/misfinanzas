import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  image?: string;
  nombre?: string;
  apellido?: string;
  rut?: string; // formato: "12345678-9"
  telefono?: string;
  emailVerified: Date | null;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  tipoIngreso?: "dependiente" | "honorarios" | "mixto" | "negocio" | "informal";
  profileComplete: boolean;
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
    // 50/30/20 — bucket donde caen las donaciones (default: deseos).
    donacionesBucket: "necesidades" | "deseos" | "ahorros";
    // Override por categoría del mapeo 50/30/20 (default vive en lib/categorias.ts).
    categoriasOverride?: Record<string, "necesidades" | "deseos" | "ahorros">;
    // Tope imponible mensual para cotizaciones independientes (UF, ajusta SII).
    topeImponibleUF: number;
    // Cotizaciones obligatorias adicionales (Ley 21.133).
    sisPorcentaje: number; // SIS — Seguro Invalidez y Sobrevivencia
    accTrabajoPorcentaje: number; // Mutual / Accidentes del Trabajo
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
    },
    password: { type: String, select: false },
    image: { type: String },
    nombre: { type: String, trim: true },
    apellido: { type: String, trim: true },
    rut: { type: String },
    telefono: { type: String },
    emailVerified: { type: Date, default: null },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    resetToken: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    tipoIngreso: {
      type: String,
      enum: ["dependiente", "honorarios", "mixto", "negocio", "informal"],
      default: "honorarios",
    },
    profileComplete: { type: Boolean, default: false, index: true },
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
      donacionesBucket: {
        type: String,
        enum: ["necesidades", "deseos", "ahorros"],
        default: "deseos",
      },
      categoriasOverride: { type: Schema.Types.Mixed, default: {} },
      topeImponibleUF: { type: Number, default: 87.8 },
      sisPorcentaje: { type: Number, default: 0.0154 },
      accTrabajoPorcentaje: { type: Number, default: 0.0095 },
    },
    stats: {
      totalBoletas: { type: Number, default: 0 },
      totalIngresado: { type: Number, default: 0 },
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// rut is optional (Google OAuth users fill it in /completar-perfil). Unique only when present.
UserSchema.index(
  { rut: 1 },
  { unique: true, partialFilterExpression: { rut: { $type: "string" } } }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
