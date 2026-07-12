import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { crearSesion } from "@/lib/session";
import { ErrorAplicacion } from "@/lib/errors";
import { LimitadorService, type PoliticaLimite } from "@/lib/services/limitador-service";

/**
 * Política de bloqueo de login (Módulo 6 — Sprint 4, sección 6): 5 intentos
 * fallidos en 15 minutos bloquean el par usuario+IP por otros 15 minutos.
 * La clave combina usuario e IP — no solo el usuario — para que alguien no
 * pueda bloquear al administrador real a propósito solo repitiendo
 * contraseñas incorrectas contra su nombre de usuario desde otro origen.
 */
const POLITICA_LOGIN: PoliticaLimite = {
  maxIntentos: 5,
  ventanaMs: 15 * 60 * 1000,
  bloqueoMs: 15 * 60 * 1000,
};

/** A1 — login del administrador (Sprint 4, sección 4.1). */
export const AuthService = {
  async iniciarSesion(usuario: unknown, password: unknown, ip: string): Promise<void> {
    if (
      typeof usuario !== "string" ||
      typeof password !== "string" ||
      !usuario ||
      !password
    ) {
      throw new ErrorAplicacion(
        "CREDENCIALES_INVALIDAS",
        "Usuario o contraseña incorrectos.",
      );
    }

    const clave = `login:${usuario.trim().toLowerCase()}:${ip}`;
    const bloqueo = await LimitadorService.verificarBloqueo(clave);
    if (bloqueo.bloqueado) {
      throw new ErrorAplicacion(
        "DEMASIADOS_INTENTOS",
        "Demasiados intentos fallidos. Probá de nuevo en unos minutos.",
      );
    }

    const admin = await prisma.administrador.findUnique({ where: { usuario } });
    // Mensaje idéntico exista o no el usuario — no hay que confirmarle a un
    // atacante si un nombre de usuario es válido o no.
    if (!admin || !verifyPassword(password, admin.contrasenaHash)) {
      await LimitadorService.registrarIntento(clave, POLITICA_LOGIN);
      throw new ErrorAplicacion(
        "CREDENCIALES_INVALIDAS",
        "Usuario o contraseña incorrectos.",
      );
    }

    await LimitadorService.resetear(clave);

    await prisma.administrador.update({
      where: { id: admin.id },
      data: { ultimoIngreso: new Date() },
    });

    await crearSesion(admin.id, admin.usuario);
  },
};
