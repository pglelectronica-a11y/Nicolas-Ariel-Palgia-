/**
 * Datos de prueba mínimos — solo para validar que el modelo de datos y,
 * desde el Módulo 5, el login real, funcionan de punta a punta. No es
 * lógica de negocio: nada de esto valida reglas funcionales, solo inserta
 * filas de ejemplo directamente.
 *
 * Credenciales de administrador para desarrollo local: admin / PglClub2026!
 * (documentadas también en el README — nunca usar esta contraseña en producción).
 */
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.administrador.upsert({
    where: { usuario: "admin" },
    update: {},
    create: {
      usuario: "admin",
      contrasenaHash: hashPassword("PglClub2026!"),
    },
  });

  const [maria, juan, laura] = await Promise.all([
    prisma.usuario.upsert({
      where: { telefono: "1111000001" },
      update: {},
      create: { nombre: "María Gómez", telefono: "1111000001" },
    }),
    prisma.usuario.upsert({
      where: { telefono: "1111000002" },
      update: {},
      create: { nombre: "Juan Pérez", telefono: "1111000002" },
    }),
    prisma.usuario.upsert({
      where: { telefono: "1111000003" },
      update: {},
      create: { nombre: "Laura Díaz", telefono: "1111000003" },
    }),
  ]);

  // Sorteo activo — modalidad EXACTO, rango de números configurable (0 a 99).
  const cierreFuturo = new Date();
  cierreFuturo.setDate(cierreFuturo.getDate() + 5);

  const sorteoActivo = await prisma.sorteo.create({
    data: {
      premio: 'Smart TV 50"',
      imagenUrl: null,
      fechaCierre: cierreFuturo,
      numeroInicial: 0,
      cantidadNumeros: 100,
      modalidadGanador: "EXACTO",
      estado: "ACTIVO",
    },
  });

  await prisma.participacion.createMany({
    data: [
      { sorteoId: sorteoActivo.id, usuarioId: maria.id, numero: 34 },
      { sorteoId: sorteoActivo.id, usuarioId: juan.id, numero: 7 },
      { sorteoId: sorteoActivo.id, usuarioId: laura.id, numero: 52 },
    ],
  });

  // Sorteo ya cerrado y publicado — modalidad MAS_CERCANO, demuestra que
  // numeroPremiado puede ser distinto de numeroGanador.
  const cierrePasado = new Date();
  cierrePasado.setDate(cierrePasado.getDate() - 7);

  const sorteoPublicado = await prisma.sorteo.create({
    data: {
      premio: "Auriculares Bluetooth",
      fechaInicio: new Date(cierrePasado.getTime() - 7 * 24 * 60 * 60 * 1000),
      fechaCierre: cierrePasado,
      numeroInicial: 1,
      cantidadNumeros: 50,
      modalidadGanador: "MAS_CERCANO",
      estado: "PUBLICADO",
    },
  });

  const participacionGanadora = await prisma.participacion.create({
    data: { sorteoId: sorteoPublicado.id, usuarioId: juan.id, numero: 45 },
  });

  const resultado = await prisma.resultado.create({
    data: {
      sorteoId: sorteoPublicado.id,
      numeroGanador: 47, // salió el 47 en la Quiniela...
      numeroPremiado: 45, // ...pero el 47 no estaba reservado: gana el más cercano (45)
      participacionId: participacionGanadora.id,
      publicadoEn: new Date(),
      verificadoWhatsapp: true,
      premioEntregado: true,
    },
  });

  await prisma.auditoria.createMany({
    data: [
      {
        administradorId: admin.id,
        accion: "CREAR_SORTEO",
        entidadTipo: "SORTEO",
        entidadId: sorteoActivo.id,
        detalle: `Sorteo "${sorteoActivo.premio}" creado.`,
      },
      {
        administradorId: admin.id,
        accion: "PUBLICAR_RESULTADO",
        entidadTipo: "SORTEO",
        entidadId: sorteoPublicado.id,
        detalle: `Resultado publicado: número premiado ${resultado.numeroPremiado}.`,
      },
      {
        administradorId: admin.id,
        accion: "ENTREGAR_PREMIO",
        entidadTipo: "PARTICIPACION",
        entidadId: participacionGanadora.id,
        detalle: "Premio entregado a Juan Pérez, verificado en WhatsApp.",
      },
    ],
  });

  await prisma.configuracion.createMany({
    data: [
      { clave: "nombre_empresa", valor: "PGL Electrónica" },
      { clave: "whatsapp_canal_url", valor: "https://wa.me/pglelectronica" },
      { clave: "instagram_url", valor: "https://instagram.com/pglelectronica" },
    ],
    skipDuplicates: true,
  });

  // Un evento de ejemplo para probar que la tabla reservada acepta filas,
  // sin que ningún servicio la use todavía.
  await prisma.eventoMetrica.create({
    data: {
      tipo: "PARTICIPACION",
      sorteoId: sorteoActivo.id,
      origen: "whatsapp",
    },
  });

  console.log("Seed completo:");
  console.log(`  Administrador: ${admin.usuario}`);
  console.log(`  Usuarios: ${[maria, juan, laura].map((u) => u.nombre).join(", ")}`);
  console.log(
    `  Sorteos: "${sorteoActivo.premio}" (activo), "${sorteoPublicado.premio}" (publicado)`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
