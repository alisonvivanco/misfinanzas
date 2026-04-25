import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import { Income } from "@/models/Income";
import { Expense } from "@/models/Expense";
import { Donation } from "@/models/Donation";
import { RecurringExpense } from "@/models/RecurringExpense";
import { Saving } from "@/models/Saving";
import { Debt } from "@/models/Debt";
import { requireActiveUser, bad } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const u = await requireActiveUser();
  if ("error" in u) return u.error;
  const { searchParams } = new URL(req.url);
  const anio = Number(searchParams.get("anio"));
  if (!anio) return bad("anio requerido");

  await dbConnect();
  const userObjectId = new mongoose.Types.ObjectId(u.userId);
  const yearStart = new Date(`${anio}-01-01T00:00:00Z`);
  const yearEnd = new Date(`${anio + 1}-01-01T00:00:00Z`);

  const [
    incomes,
    expenses,
    donations,
    recurring,
    savingContribs,
    debtPayments,
    savingsAll,
    debtsAll,
  ] = await Promise.all([
    Income.aggregate([
      { $match: { userId: userObjectId, anio } },
      { $group: { _id: "$mes", total: { $sum: "$monto" } } },
    ]),
    Expense.aggregate([
      { $match: { userId: userObjectId, anio } },
      { $group: { _id: "$mes", total: { $sum: "$monto" } } },
    ]),
    Donation.aggregate([
      { $match: { userId: userObjectId, anio } },
      { $group: { _id: "$mes", total: { $sum: "$monto" } } },
    ]),
    RecurringExpense.find({ userId: u.userId, activo: true }).select("monto").lean(),
    // Saving contributions grouped by month of fecha (within year).
    Saving.aggregate([
      { $match: { userId: userObjectId } },
      { $unwind: "$contribuciones" },
      { $match: { "contribuciones.fecha": { $gte: yearStart, $lt: yearEnd } } },
      {
        $group: {
          _id: { $month: "$contribuciones.fecha" },
          total: { $sum: "$contribuciones.monto" },
        },
      },
    ]),
    // Debt payments grouped by month of fecha (within year).
    Debt.aggregate([
      { $match: { userId: userObjectId } },
      { $unwind: "$pagos" },
      { $match: { "pagos.fecha": { $gte: yearStart, $lt: yearEnd } } },
      {
        $group: {
          _id: { $month: "$pagos.fecha" },
          total: { $sum: "$pagos.monto" },
        },
      },
    ]),
    // Lifetime totals for the headline KPIs.
    Saving.find({ userId: u.userId }).select("montoAhorrado").lean(),
    Debt.find({ userId: u.userId }).select("pagado").lean(),
  ]);

  const fixedTotal = recurring.reduce((s, r) => s + (r.monto || 0), 0);

  const meses = Array.from({ length: 12 }, (_, i) => i + 1);
  const ingresosByMes: Record<number, number> = {};
  const variableByMes: Record<number, number> = {};
  const donacionesByMes: Record<number, number> = {};
  const aportesByMes: Record<number, number> = {};
  const pagosDeudaByMes: Record<number, number> = {};

  for (const r of incomes) ingresosByMes[r._id] = r.total;
  for (const r of expenses) variableByMes[r._id] = r.total;
  for (const r of donations) donacionesByMes[r._id] = r.total;
  for (const r of savingContribs) aportesByMes[r._id] = r.total;
  for (const r of debtPayments) pagosDeudaByMes[r._id] = r.total;

  const rows = meses.map((m) => {
    const ingreso = ingresosByMes[m] || 0;
    const variable = variableByMes[m] || 0;
    const donacion = donacionesByMes[m] || 0;
    const aportes = aportesByMes[m] || 0;
    const pagosDeuda = pagosDeudaByMes[m] || 0;
    // Fixed expenses are projected every month (they recur regardless of income).
    const fijos = fixedTotal;
    const gastoTotal = fijos + variable + donacion;
    return {
      mes: m,
      ingreso,
      gastosFijos: fijos,
      gastosVariables: variable,
      donaciones: donacion,
      gastoTotal,
      aportesAhorro: aportes,
      pagosDeuda,
      // "Te queda" — todos los outflows del mes (gastos + aportes + pagos a deuda).
      balance: ingreso - gastoTotal - aportes - pagosDeuda,
    };
  });

  const totales = rows.reduce(
    (a, r) => ({
      ingreso: a.ingreso + r.ingreso,
      gastosFijos: a.gastosFijos + r.gastosFijos,
      gastosVariables: a.gastosVariables + r.gastosVariables,
      donaciones: a.donaciones + r.donaciones,
      gastoTotal: a.gastoTotal + r.gastoTotal,
      aportesAhorro: a.aportesAhorro + r.aportesAhorro,
      pagosDeuda: a.pagosDeuda + r.pagosDeuda,
      balance: a.balance + r.balance,
    }),
    {
      ingreso: 0, gastosFijos: 0, gastosVariables: 0, donaciones: 0,
      gastoTotal: 0, aportesAhorro: 0, pagosDeuda: 0, balance: 0,
    }
  );

  const ahorroAcumulado = savingsAll.reduce((s, x) => s + (x.montoAhorrado || 0), 0);
  const deudaPagadaLifetime = debtsAll.reduce((s, x) => s + (x.pagado || 0), 0);

  return NextResponse.json({
    anio,
    rows,
    totales,
    ahorroAcumulado,
    deudaPagadaLifetime,
  });
}
