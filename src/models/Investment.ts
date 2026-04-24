import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInvestmentTransaction {
  fecha: Date;
  tipo: "compra" | "venta" | "dividendo" | "interes" | "aporte" | "rescate";
  unidades?: number;
  precio?: number;
  monto: number;
  notas?: string;
}

export interface IInvestment extends Document {
  userId: Types.ObjectId;
  nombre: string;
  ticker?: string;
  tipo: "apv" | "fondo_mutuo" | "acciones" | "etf" | "cripto" | "deposito_plazo" | "bonos" | "otros";
  institucion?: string;
  capitalInvertido: number;
  unidades: number;
  precioPromedio: number;
  precioActual: number;
  valorActual: number;
  gananciaPerdida: number;
  rentabilidadPorcentaje: number;
  moneda: "CLP" | "USD" | "UF";
  fechaPrimerAporte: Date;
  transacciones: IInvestmentTransaction[];
  regimenTributario?: "a" | "b" | "otro"; // APV: letra A o B (Ley 19.768)
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nombre: { type: String, required: true, trim: true },
    ticker: { type: String, trim: true, uppercase: true },
    tipo: {
      type: String,
      enum: [
        "apv",
        "fondo_mutuo",
        "acciones",
        "etf",
        "cripto",
        "deposito_plazo",
        "bonos",
        "otros",
      ],
      required: true,
    },
    institucion: { type: String, trim: true },
    capitalInvertido: { type: Number, required: true, min: 0 },
    unidades: { type: Number, default: 0 },
    precioPromedio: { type: Number, default: 0 },
    precioActual: { type: Number, default: 0 },
    valorActual: { type: Number, default: 0 },
    gananciaPerdida: { type: Number, default: 0 },
    rentabilidadPorcentaje: { type: Number, default: 0 },
    moneda: { type: String, enum: ["CLP", "USD", "UF"], default: "CLP" },
    fechaPrimerAporte: { type: Date, required: true },
    transacciones: [
      {
        fecha: { type: Date, required: true },
        tipo: {
          type: String,
          enum: ["compra", "venta", "dividendo", "interes", "aporte", "rescate"],
          required: true,
        },
        unidades: Number,
        precio: Number,
        monto: { type: Number, required: true },
        notas: String,
      },
    ],
    regimenTributario: {
      type: String,
      enum: ["a", "b", "otro"],
    },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

InvestmentSchema.index({ userId: 1, activa: 1 });

// Hook: recalcular ganancia/pérdida y rentabilidad
InvestmentSchema.pre("save", function (next) {
  if (this.unidades && this.precioActual) {
    this.valorActual = this.unidades * this.precioActual;
  }
  this.gananciaPerdida = this.valorActual - this.capitalInvertido;
  this.rentabilidadPorcentaje =
    this.capitalInvertido > 0
      ? this.gananciaPerdida / this.capitalInvertido
      : 0;
  next();
});

export const Investment: Model<IInvestment> =
  mongoose.models.Investment ||
  mongoose.model<IInvestment>("Investment", InvestmentSchema);
