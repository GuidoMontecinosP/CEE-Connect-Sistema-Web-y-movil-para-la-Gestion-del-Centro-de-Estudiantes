"use strict";
import { Router } from "express";
import { isAdmin } from "../middlewares/authorization.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from "../controllers/usuario.controller.js";

const router = Router();

// Protegidas: requieren JWT y ser administrador
router.use(authenticateJwt);
router.use(isAdmin);

router
  .get("/", getUsers)
  .get("/detail", getUser)
  .patch("/detail", updateUser)
  .delete("/detail", deleteUser);

export default router;
