"use strict";
import { EntitySchema } from "typeorm";

const RolSchema = new EntitySchema({
  name: "Rol",
  tableName: "roles",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 50,
      unique: true,
      nullable: false,
    },
    isAdmin: {
      type: "boolean",
      default: false,
      nullable: false,
    },
    isSuperAdmin: {
      type: "boolean",
      default: false,
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
});

export default RolSchema;
