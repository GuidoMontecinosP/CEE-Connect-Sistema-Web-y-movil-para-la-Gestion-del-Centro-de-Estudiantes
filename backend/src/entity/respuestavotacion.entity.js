import { EntitySchema } from "typeorm";

const RespuestaVotacionSchema = new EntitySchema({
  name: "RespuestaVotacion",
  tableName: "respuestas_votacion",
  columns: {
    id: { type: "int", primary: true, generated: true },
    fecha: {
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
    opcion: {
      type: "many-to-one",
      target: "OpcionVotacion",
      joinColumn: true,
      onDelete: "CASCADE",
    },
  },
});

export default RespuestaVotacionSchema;
