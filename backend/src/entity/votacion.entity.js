import { EntitySchema } from "typeorm";

const VotacionSchema = new EntitySchema({
  name: "Votacion",
  tableName: "votaciones",
  columns: {
    id: { type: "int", primary: true, generated: true },
    titulo: { type: "text" },
    descripcion: { type: "text", nullable: true },
    fechaInicio: { type: "timestamp" },
    fechaFin: { type: "timestamp" },
  },
  relations: {
    creadaPor: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: true,
      onDelete: "SET NULL",
    },
    opciones: {
      type: "one-to-many",
      target: "OpcionVotacion",
      inverseSide: "votacion",
    },
    registros: {
      type: "one-to-many",
      target: "RegistroVotante",
      inverseSide: "votacion",
    },
  },
});

export default VotacionSchema;
