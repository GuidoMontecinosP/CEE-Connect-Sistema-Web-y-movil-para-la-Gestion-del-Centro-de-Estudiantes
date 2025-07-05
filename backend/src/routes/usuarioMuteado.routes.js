// backend/src/routes/usuarioMuteado.routes.js

"use strict";

import { Router } from "express";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { mutearUsuario, desmutearUsuario } from "../controllers/usuarioMuteado.controller.js";

const router = Router();

// Solo admin puede mutear o desmutear
router.post("/:userId", authenticateJwt, isAdmin, mutearUsuario);
router.patch("/:userId", authenticateJwt, isAdmin, desmutearUsuario);

export default router;
