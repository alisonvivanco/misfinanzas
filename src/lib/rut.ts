/**
 * Validador de RUT chileno — algoritmo Módulo 11 oficial.
 * Referencia: Registro Civil de Chile.
 */

export function limpiarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

export function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return rut;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  // Formato XX.XXX.XXX-X
  const formateado = cuerpo
    .split("")
    .reverse()
    .reduce((acc, d, i) => (i > 0 && i % 3 === 0 ? d + "." + acc : d + acc), "");
  return `${formateado}-${dv}`;
}

export function calcularDigitoVerificador(rutSinDV: string): string {
  const rutLimpio = rutSinDV.replace(/\D/g, "");
  let suma = 0;
  let multiplicador = 2;
  for (let i = rutLimpio.length - 1; i >= 0; i--) {
    suma += parseInt(rutLimpio[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return "0";
  if (resto === 10) return "K";
  return String(resto);
}

export function validarRut(rut: string): boolean {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2 || limpio.length > 9) return false;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;
  return calcularDigitoVerificador(cuerpo) === dv;
}

export function normalizarRut(rut: string): string {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return rut;
  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}
