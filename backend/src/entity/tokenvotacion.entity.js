import { EntitySchema } from "typeorm";

const TokenVotacionSchema = new EntitySchema({
  name: "TokenVotacion",
  tableName: "tokens_votacion",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    token: {
      type: "varchar",
      unique: true,
      length: 36, // Para UUID
    },
    fechaCreacion: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    votacion: {
      type: "many-to-one",
      target: "Votacion",
      joinColumn: true,
      onDelete: "CASCADE",
    },
    usuario: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: true,
      onDelete: "CASCADE",
    },
  },
});

export default TokenVotacionSchema;