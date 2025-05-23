import { EntitySchema } from "typeorm";

const UsuarioSchema = new EntitySchema({
  name: "Usuario", // 
  tableName: "usuarios",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
    },
    correo: {
      type: "varchar",
      unique: true,
    },
    contraseña: {
      type: "text",
    },
    rol: {
      type: "varchar",
    },
  },
});

export default UsuarioSchema;
