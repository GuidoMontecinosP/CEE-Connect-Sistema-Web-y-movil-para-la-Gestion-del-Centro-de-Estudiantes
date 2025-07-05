// backend/src/entity/sugerencia.entity.js
"use strict";

import { EntitySchema } from "typeorm";

const SugerenciaSchema = new EntitySchema({
  name: "Sugerencia",
  tableName: "sugerencias",
  columns: {
    id: {
      primary: true,
      type: "int", 
      generated: true,
    },
    titulo: {
      type: "varchar",
      length: 200,
      nullable: false,
    },
    mensaje: {
      type: "text",
      nullable: false,
    },
    categoria: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    contacto: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "pendiente",
      nullable: false,
    },
    isReportada: {
      type: "boolean",
      default: false,
      nullable: false,
    },
    respuestaAdmin: {
      type: "text",
      nullable: true,
    },
    fechaRespuesta: {
      type: "timestamp with time zone",
      nullable: true,
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "timestamp with time zone", 
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    autor: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: {
        name: "autorId",
      },
      onDelete: "CASCADE",
      eager: true,
    },
    adminResponsable: {
      type: "many-to-one", 
      target: "Usuario",
      joinColumn: {
        name: "adminResponsableId",
      },
      nullable: true,
      eager: false,
    },
  },
});

export default SugerenciaSchema;