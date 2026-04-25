import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  image?: string;
  nombre?: string;
  apellido?: string;
  rut?: string;
  telefono?: string;
  emailVerified: Date | null;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetToken?: string;
  resetTokenExpires?: Date;
  profileComplete: boolean;
  plan: "trial" | "free" | "premium" | "pro";
  trialEndsAt?: Date;
  subscribedUntil?: Date;
  /** MercadoPago preapproval ID (suscripción) — populated by webhook. */
  mpPreapprovalId?: string;
  /** MP preapproval status (authorized/paused/cancelled). */
  mpStatus?: string;
  configuracion: {
    monedaPreferida: string;
    donacionesBucket: "necesidades" | "deseos" | "ahorros";
    categoriasOverride?: Record<string, "necesidades" | "deseos" | "ahorros">;
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
    profileComplete: { type: Boolean, default: false, index: true },
    plan: {
      type: String,
      enum: ["trial", "free", "premium", "pro"],
      default: "trial",
    },
    trialEndsAt: { type: Date },
    subscribedUntil: { type: Date },
    mpPreapprovalId: { type: String, index: true, sparse: true },
    mpStatus: { type: String },
    configuracion: {
      monedaPreferida: { type: String, default: "CLP" },
      donacionesBucket: {
        type: String,
        enum: ["necesidades", "deseos", "ahorros"],
        default: "deseos",
      },
      categoriasOverride: { type: Schema.Types.Mixed, default: {} },
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
