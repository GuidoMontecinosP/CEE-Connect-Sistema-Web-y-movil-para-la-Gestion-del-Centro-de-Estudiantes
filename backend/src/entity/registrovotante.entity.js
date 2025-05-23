import { EntitySchema } from "typeorm";

const RegistroVotanteSchema = new EntitySchema({
  name: "RegistroVotante",
  tableName: "registro_votantes",
  columns: {
    id: { type: "int", primary: true, generated: true },
    fecha: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  uniques: [
    {
      name: "UNIQUE_VOTACION_USUARIO",
      columns: ["votacion", "usuario"],
    },
  ],
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
    },
  },
});

export default RegistroVotanteSchema;
