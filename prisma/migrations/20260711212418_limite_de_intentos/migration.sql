-- CreateTable
CREATE TABLE "intentos_acceso" (
    "clave" TEXT NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 1,
    "primer_intento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bloqueado_hasta" TIMESTAMP(3),
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intentos_acceso_pkey" PRIMARY KEY ("clave")
);
