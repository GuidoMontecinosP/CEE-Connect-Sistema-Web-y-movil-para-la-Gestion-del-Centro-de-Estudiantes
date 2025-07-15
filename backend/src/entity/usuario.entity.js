"use strict";
import { EntitySchema } from "typeorm";

const UsuarioSchema = new EntitySchema({
  name: "Usuario",
  tableName: "usuarios",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
    },
    correo: {
      type: "varchar",
      unique: true,
    },
    contrasena: {
      type: "text",
    },
    estado: {
      type: "varchar",
      length: 15,
      default: "activo",
      nullable: false,
    },
    verificado: {
      type: "boolean",
      default: false,
      nullable: false,
    },
    createdAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    rol: {
      type: "many-to-one",
      target: "Rol",
      joinColumn: {
        name: "rolId",
      },
      onDelete: "CASCADE",
      eager: true,
    },
  },
});

export default UsuarioSchema;
