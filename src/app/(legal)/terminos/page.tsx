export const metadata = { title: "Términos y condiciones" };

export default function TerminosPage() {
  return (
    <>
      <h1>Términos y condiciones</h1>
      <p className="text-sm text-muted-foreground">Última actualización: abril 2026</p>

      <h2>1. Sobre el servicio</h2>
      <p>
        MisFinanzas es una herramienta de presupuesto personal en línea operada por
        Alison Vivanco como parte del sitio AlisonVivanco.cl. Permite registrar
        ingresos, gastos, deudas y ahorros, y muestra cálculos automáticos sobre esa
        información.
      </p>

      <h2>2. Cuenta</h2>
      <p>
        Para usar la herramienta necesitás crear una cuenta con tu email y/o cuenta
        de Google. Sos responsable de mantener la confidencialidad de tus credenciales.
        Te pedimos tu RUT y teléfono únicamente para identificarte; no los compartimos
        con terceros.
      </p>

      <h2>3. Suscripción</h2>
      <p>
        El servicio ofrece un período de prueba gratuito. Vencido ese plazo, debés
        suscribirte a través de MercadoPago para seguir usándolo. La suscripción se
        renueva automáticamente y podés cancelarla en cualquier momento desde tu
        cuenta de MercadoPago. Los pagos los procesa íntegramente MercadoPago Chile;
        no almacenamos datos de tu tarjeta.
      </p>

      <h2>4. Uso aceptable</h2>
      <ul>
        <li>No registres datos de terceros sin su consentimiento.</li>
        <li>No intentes acceder a cuentas que no son tuyas.</li>
        <li>No uses la herramienta para actividades ilegales.</li>
      </ul>

      <h2>5. Limitación de responsabilidad</h2>
      <p>
        MisFinanzas es una herramienta informativa. No somos asesores financieros ni
        contadores. Las decisiones que tomes con base en lo que ves acá son tu
        responsabilidad. El servicio se entrega &quot;tal cual&quot; sin garantías
        explícitas.
      </p>

      <h2>6. Cambios</h2>
      <p>
        Podemos actualizar estos términos. Si el cambio es significativo, te
        avisaremos por correo. Si seguís usando el servicio después del cambio,
        aceptás los nuevos términos.
      </p>

      <h2>7. Contacto</h2>
      <p>Cualquier duda escribinos a hola@misfinanzas.alisonvivanco.cl</p>
    </>
  );
}
