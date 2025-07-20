"use strict";
import { Router } from "express";
import { isSuperAdmin } from "../middlewares/superadmin.middleware.js";
import { authenticateJwt } from "../middlewares/authentication.middleware.js";
import {
  getAllUsers,
  toggleUserRole,
  getUserStats,
} from "../controllers/superadmin.controller.js";

const router = Router();


// Aplicar middlewares: JWT + SuperAdmin
router.use(authenticateJwt);
router.use(isSuperAdmin);

// Rutas del superadmin
router.get("/users", getAllUsers);
router.patch("/users/:userId/toggle-role", toggleUserRole);
router.get("/stats", getUserStats);

export default router;

// Actualización para routes/index.routes.js - Agregar esta línea
// import superadminRoutes from "./superadmin.routes.js";
// router.use("/superadmin", superadminRoutes);
