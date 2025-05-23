import { EntitySchema } from "typeorm";

const OpcionVotacionSchema = new EntitySchema({
  name: "OpcionVotacion",
  tableName: "opciones_votacion",
  columns: {
    id: { type: "int", primary: true, generated: true },
    textoOpcion: { type: "text" },
  },
  relations: {
    votacion: {
      type: "many-to-one",
      target: "Votacion",
      joinColumn: true,
      onDelete: "CASCADE",
    },
    respuestas: {
      type: "one-to-many",
      target: "RespuestaVotacion",
      inverseSide: "opcion",
    },
  },
});

export default OpcionVotacionSchema;
