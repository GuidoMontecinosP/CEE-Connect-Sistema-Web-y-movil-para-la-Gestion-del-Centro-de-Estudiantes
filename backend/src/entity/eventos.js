import { EntitySchema } from "typeorm";

const EventosSchema = new EntitySchema({
  name: "Evento", // Nombre de la entidad
  tableName: "eventos", // Nombre de la tabla en la base de datos
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
    descripcion: {
      type: "varchar"
    },
    fecha: {
      type: "date",
      default: () => "CURRENT_TIMESTAMP",
    },
    hora: {
      type: "time",
      default: () => "CURRENT_TIMESTAMP",
    },
    lugar: {
      type: "varchar",
      length: 100,
    },
    tipo: {
        type: "varchar", //(reuniones, fiestas, etc)
        length: 100,
    },
    estado: {
      type: "varchar",
      default: "activo",
      length: 50,
    }
  },
});
export default EventosSchema;