//routes/usuarioMuteado.routes.js
import { EntitySchema } from "typeorm";

const UsuarioMuteadoSchema = new EntitySchema({
  name: "UsuarioMuteado",
  tableName: "usuarios_muteados",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    razon: {
      type: "text",
      nullable: false,
    },
    fecha_inicio: {
      type: "timestamp with time zone",
      default: () => "CURRENT_TIMESTAMP",
    },
    fecha_fin: {
      type: "timestamp with time zone",
      nullable: false,
    },
    activo: {
      type: "boolean",
      default: true,
    }
  },
  relations: {
    usuario: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: {
        name: "userId",
      },
      onDelete: "CASCADE",
      eager: true,
    },
  },
});

export default UsuarioMuteadoSchema;
