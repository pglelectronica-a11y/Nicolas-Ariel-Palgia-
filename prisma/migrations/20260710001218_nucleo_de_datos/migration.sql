-- CreateEnum
CREATE TYPE "estado_sorteo" AS ENUM ('BORRADOR', 'ACTIVO', 'CERRADO', 'RESULTADO_OBTENIDO', 'PUBLICADO', 'DESIERTO');

-- CreateEnum
CREATE TYPE "modalidad_ganador" AS ENUM ('EXACTO', 'MAS_CERCANO');

-- CreateEnum
CREATE TYPE "accion_auditoria" AS ENUM ('CREAR_SORTEO', 'EDITAR_SORTEO', 'ELIMINAR_PARTICIPANTE', 'LIBERAR_NUMERO', 'PUBLICAR_RESULTADO', 'ENTREGAR_PREMIO');

-- CreateEnum
CREATE TYPE "tipo_entidad_auditoria" AS ENUM ('SORTEO', 'PARTICIPACION');

-- CreateEnum
CREATE TYPE "tipo_evento_metrica" AS ENUM ('PARTICIPACION', 'VISITA', 'CONVERSION_WHATSAPP', 'CONVERSION_INSTAGRAM', 'CONVERSION_FACEBOOK', 'CONVERSION_CAMPANA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sorteos" (
    "id" TEXT NOT NULL,
    "premio" TEXT NOT NULL,
    "imagen_url" TEXT,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cierre" TIMESTAMP(3) NOT NULL,
    "numero_inicial" INTEGER NOT NULL DEFAULT 0,
    "cantidad_numeros" INTEGER NOT NULL,
    "modalidad_ganador" "modalidad_ganador" NOT NULL DEFAULT 'EXACTO',
    "estado" "estado_sorteo" NOT NULL DEFAULT 'BORRADOR',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sorteos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participaciones" (
    "id" TEXT NOT NULL,
    "sorteo_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados" (
    "id" TEXT NOT NULL,
    "sorteo_id" TEXT NOT NULL,
    "numero_ganador" INTEGER NOT NULL,
    "numero_premiado" INTEGER,
    "participacion_id" TEXT,
    "publicado_en" TIMESTAMP(3),
    "verificado_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "premio_entregado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administradores" (
    "id" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "contrasena_hash" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_ingreso" TIMESTAMP(3),

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL,
    "administrador_id" TEXT NOT NULL,
    "accion" "accion_auditoria" NOT NULL,
    "entidad_tipo" "tipo_entidad_auditoria" NOT NULL,
    "entidad_id" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("clave")
);

-- CreateTable
CREATE TABLE "eventos_metricas" (
    "id" TEXT NOT NULL,
    "tipo" "tipo_evento_metrica" NOT NULL,
    "sorteo_id" TEXT,
    "origen" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_metricas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telefono_key" ON "usuarios"("telefono");

-- CreateIndex
CREATE INDEX "sorteos_estado_idx" ON "sorteos"("estado");

-- CreateIndex
CREATE INDEX "participaciones_sorteo_id_idx" ON "participaciones"("sorteo_id");

-- CreateIndex
CREATE INDEX "participaciones_usuario_id_idx" ON "participaciones"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "un_numero_un_dueno" ON "participaciones"("sorteo_id", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "un_usuario_un_numero_por_sorteo" ON "participaciones"("sorteo_id", "usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "resultados_sorteo_id_key" ON "resultados"("sorteo_id");

-- CreateIndex
CREATE UNIQUE INDEX "resultados_participacion_id_key" ON "resultados"("participacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "administradores_usuario_key" ON "administradores"("usuario");

-- CreateIndex
CREATE INDEX "auditoria_creado_en_idx" ON "auditoria"("creado_en");

-- CreateIndex
CREATE INDEX "auditoria_administrador_id_idx" ON "auditoria"("administrador_id");

-- CreateIndex
CREATE INDEX "eventos_metricas_tipo_idx" ON "eventos_metricas"("tipo");

-- CreateIndex
CREATE INDEX "eventos_metricas_sorteo_id_idx" ON "eventos_metricas"("sorteo_id");

-- AddForeignKey
ALTER TABLE "participaciones" ADD CONSTRAINT "participaciones_sorteo_id_fkey" FOREIGN KEY ("sorteo_id") REFERENCES "sorteos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participaciones" ADD CONSTRAINT "participaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_sorteo_id_fkey" FOREIGN KEY ("sorteo_id") REFERENCES "sorteos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados" ADD CONSTRAINT "resultados_participacion_id_fkey" FOREIGN KEY ("participacion_id") REFERENCES "participaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_administrador_id_fkey" FOREIGN KEY ("administrador_id") REFERENCES "administradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_metricas" ADD CONSTRAINT "eventos_metricas_sorteo_id_fkey" FOREIGN KEY ("sorteo_id") REFERENCES "sorteos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
