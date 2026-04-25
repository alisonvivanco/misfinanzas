import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import { Income } from "@/models/Income";
import { Expense } from "@/models/Expense";
import { Donation } from "@/models/Donation";
import { RecurringExpense } from "@/models/RecurringExpense";
import { Saving } from "@/models/Saving";
import { Debt } from "@/models/Debt";
import { requireUser, bad } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const u = await requireUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const anio = Number(searchParams.get("anio"));
  if (!anio) return bad("anio requerido");

  await dbConnect();
  const [incomes, expenses, donations, recurring, savings, debts] = await Promise.all([
    Income.aggregate([
      { $match: { userId: u.userId as any, anio } },
      { $group: { _id: "$mes", total: { $sum: "$monto" } } },
    ]),
    Expense.aggregate([
      { $match: { userId: u.userId as any, anio } },
      { $group: { _id: "$mes", total: { $sum: "$monto" }, ahorros: { $sum: { $cond: [{ $eq: ["$tipo", "ahorros"] }, "$monto", 0] } } } },
    ]),
    Donation.aggregate([
      { $match: { userId: u.userId as any, anio } },
      { $group: { _id: "$mes", total: { $sum: "$monto" } } },
    ]),
    RecurringExpense.find({ userId: u.userId, activo: true }).select("monto").lean(),
    Saving.find({ userId: u.userId }).select("montoAhorrado").lean(),
    Debt.find({ userId: u.userId }).select("pagado").lean(),
  ]);

  const fixedTotal = recurring.reduce((s, r) => s + (r.monto || 0), 0);

  // Build 12-month grid
  const meses = Array.from({ length: 12 }, (_, i) => i + 1);
  const ingresosByMes: Record<number, number> = {};
  const variableByMes: Record<number, number> = {};
  const ahorrosByMes: Record<number, number> = {};
  const donacionesByMes: Record<number, number> = {};

  for (const r of incomes) ingresosByMes[r._id] = r.total;
  for (const r of expenses) {
    variableByMes[r._id] = r.total;
    ahorrosByMes[r._id] = r.ahorros;
  }
  for (const r of donations) donacionesByMes[r._id] = r.total;

  const rows = meses.map((m) => {
    const ingreso = ingresosByMes[m] || 0;
    const variable = variableByMes[m] || 0;
    const donacion = donacionesByMes[m] || 0;
    const ahorrosM = ahorrosByMes[m] || 0;
    const fijos = ingreso > 0 ? fixedTotal : 0; // solo proyectar fijos en meses con ingreso
    const gastoTotal = fijos + variable + donacion;
    return {
      mes: m,
      ingreso,
      gastosFijos: fijos,
      gastosVariables: variable,
      donaciones: donacion,
      gastoTotal,
      ahorros: ahorrosM,
      balance: ingreso - gastoTotal,
    };
  });

  const totales = rows.reduce(
    (a, r) => ({
      ingreso: a.ingreso + r.ingreso,
      gastosFijos: a.gastosFijos + r.gastosFijos,
      gastosVariables: a.gastosVariables + r.gastosVariables,
      donaciones: a.donaciones + r.donaciones,
      gastoTotal: a.gastoTotal + r.gastoTotal,
      ahorros: a.ahorros + r.ahorros,
      balance: a.balance + r.balance,
    }),
    { ingreso: 0, gastosFijos: 0, gastosVariables: 0, donaciones: 0, gastoTotal: 0, ahorros: 0, balance: 0 }
  );

  const ahorroAcumulado = savings.reduce((s, x) => s + (x.montoAhorrado || 0), 0);
  const deudaPagada = debts.reduce((s, x) => s + (x.pagado || 0), 0);

  return NextResponse.json({ anio, rows, totales, ahorroAcumulado, deudaPagada });
}
