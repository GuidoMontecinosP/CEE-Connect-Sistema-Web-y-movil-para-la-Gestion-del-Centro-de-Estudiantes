import { EntitySchema } from "typeorm";

const VotacionSchema = new EntitySchema({
  name: "Votacion",
  tableName: "votaciones",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    titulo: {
      type: "varchar",
      length: 300,
    },
    estado: {
      type: "enum",
      enum: ["activa", "cerrada"],
      default: "activa",
    },
    fechaCreacion: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    fechaCierre: {
      type: "timestamp",
      nullable: true,
    },
  },
  relations: {
    opciones: {
      type: "one-to-many",
      target: "OpcionVotacion",
      inverseSide: "votacion",
    },
    tokens: {
      type: "one-to-many",
      target: "TokenVotacion",
      inverseSide: "votacion",
    },
  },
});

export default VotacionSchema;
