export const metadata = { title: "Política de privacidad" };

export default function PrivacidadPage() {
  return (
    <>
      <h1>Política de privacidad</h1>
      <p className="text-sm text-muted-foreground">Última actualización: abril 2026</p>

      <h2>1. Qué datos guardamos</h2>
      <ul>
        <li>Email, nombre, apellido, RUT y teléfono — para identificarte.</li>
        <li>Tus registros financieros (ingresos, gastos, ahorros, deudas, donaciones)
          — porque sin ellos la herramienta no tiene sentido.</li>
        <li>Datos técnicos mínimos (IP, navegador) en logs de seguridad.</li>
      </ul>

      <h2>2. Para qué los usamos</h2>
      <ul>
        <li>Mostrarte tu propio dashboard y los cálculos del 50/30/20.</li>
        <li>Enviarte el correo de verificación al crear cuenta.</li>
        <li>Procesar tu suscripción a través de MercadoPago.</li>
      </ul>
      <p>
        No vendemos ni cedemos tus datos a terceros para fines publicitarios.
      </p>

      <h2>3. Dónde se guardan</h2>
      <p>
        Tus datos viven en MongoDB Atlas (proveedor cloud) y la app corre en Vercel.
        Hacemos lo razonable para mantenerlos seguros, pero ningún sistema en línea
        es 100% inviolable.
      </p>

      <h2>4. Tus derechos</h2>
      <p>
        Podés pedir una copia de tus datos o que los eliminemos definitivamente
        escribiendo a hola@misfinanzas.alisonvivanco.cl. Procesamos la solicitud
        dentro de los 30 días.
      </p>

      <h2>5. Cookies</h2>
      <p>
        Usamos cookies estrictamente para mantener tu sesión iniciada y recordar que
        pasaste el password gate del sitio. No usamos analytics de terceros ni
        rastreo cross-site.
      </p>

      <h2>6. Menores</h2>
      <p>
        El servicio está pensado para mayores de 18 años. No recolectamos datos a
        sabiendas de menores.
      </p>

      <h2>7. Cambios</h2>
      <p>
        Si actualizamos esta política, te avisaremos por correo cuando el cambio sea
        relevante.
      </p>
    </>
  );
}
