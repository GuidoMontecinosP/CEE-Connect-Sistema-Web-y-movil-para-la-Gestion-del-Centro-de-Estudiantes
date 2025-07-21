import { EntitySchema } from "typeorm";

const AnunciosSchema = new EntitySchema({
  name: "Anuncios", // Nombre de la entidad
  tableName: "anuncios", // Nombre de la tabla en la base de datos
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true, 
    },
    titulo: {
      type: "varchar",
      length: 100,
    },
    epilogo: {
      type: "varchar"
    },
    link: {
        type: "varchar",
        nullable: true, // Permite que el campo sea nulo
    },
    tipo: {
        type: "varchar", //urgente, avisos importantes, etc.
        length: 100,
    },
    estado: {
        type: "boolean",
        default: true, // true para activo, false para inactivo
    },
    fechaPublicacion: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP", 
    },
  },
});

export default AnunciosSchema;