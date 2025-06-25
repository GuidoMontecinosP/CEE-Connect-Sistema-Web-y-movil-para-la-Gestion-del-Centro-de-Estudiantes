import { EntitySchema } from "typeorm";

const RespuestaVotacionSchema = new EntitySchema({
  name: "RespuestaVotacion",
  tableName: "respuestas_votacion",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    tokenVotacion: {
      type: "varchar",
      length: 36, // Para UUID
    },
    fechaVoto: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    opcion: {
      type: "many-to-one",
      target: "OpcionVotacion",
      joinColumn: true,
      onDelete: "CASCADE",
    },
    usuario: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: {
        name: "usuarioId"
      },
      onDelete: "CASCADE",
    },

  }
  ,
});

export default RespuestaVotacionSchema;
