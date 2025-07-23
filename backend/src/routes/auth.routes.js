"use strict";
import { Router } from "express";
import { login, logout, register, verificarCorreo,restablecerContrasena, recuperarContrasena,verificarTokenRecuperacion} from "../controllers/auth.controller.js";

const router = Router();

router
  .post("/login", login)
  .post("/register", register)
  .post("/logout", logout)
  .get("/verificar/:token", verificarCorreo)
   .post("/restablecer/:token", restablecerContrasena)
  .post("/recuperar", recuperarContrasena)
  .get("/verificar-token/:token", verificarTokenRecuperacion);
  

export default router;
