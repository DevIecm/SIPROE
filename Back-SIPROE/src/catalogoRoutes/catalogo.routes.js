import express from "express";
import { getCatalogo } from "../controllers/catalogos.controller.js";
import Middleware from "../ConfigServices/Midleware.js";

const router = express.Router();

router.get("/:catalogo", Middleware.verifyToken, getCatalogo);

export default router;