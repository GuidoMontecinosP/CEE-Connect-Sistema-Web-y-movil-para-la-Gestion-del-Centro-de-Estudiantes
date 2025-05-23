
import express from "express";
import cors from "cors";
import { connectDB } from "./config/configDb.js"; // o la ruta donde tengas tu conexión
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
await connectDB();

// Ruta base de prueba
app.get("/", (req, res) => {
  res.send("CEE Connect Backend funcionando");
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${3000}`);
});
