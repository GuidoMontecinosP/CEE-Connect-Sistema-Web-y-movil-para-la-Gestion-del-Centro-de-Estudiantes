// src/entity/reporteSugerencia.entity.js
import { EntitySchema } from "typeorm";

const ReporteSugerenciaSchema = new EntitySchema({
  name: "ReporteSugerencia",
  tableName: "reportes_sugerencias",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    motivo: {
      type: "varchar",
      length: 255,
      nullable: true
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP"
    }
  },
  relations: {
    usuario: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: { name: "usuarioId" },        // <— aquí
      onDelete: "CASCADE",
      eager: true
    },
    sugerencia: {
      type: "many-to-one",
      target: "Sugerencia",
      joinColumn: { name: "sugerenciaId" },     // <— y aquí
      onDelete: "CASCADE",
      eager: true
    }
  }
});

export default ReporteSugerenciaSchema;
