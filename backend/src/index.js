import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/configDb.js";
import indexRoutes from "./routes/index.routes.js";
import passport from "passport";
import "./config/passport.config.js";
import cookieParser from "cookie-parser";    
import authRoutes from "./routes/auth.routes.js"      

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors({
  origin: true, // o el puerto que uses con Vite o React
  credentials: true
}));


app.use(express.json());
app.use(cookieParser());     
app.use(passport.initialize());

// Conectar a la base de datos
await connectDB();

// Ruta base de prueba
app.get("/conexion", (req, res) => {
  res.send("CEE Connect Backend funcionando correctamente");
});

// Rutas principales
app.use("/api", indexRoutes);

// ✅ Rutas de autenticación
app.use("/api/auth", authRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}/api`);





});