import { Router } from "express";
import {
    register,
    login,
    dashboard,
    logout,
} from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/dashboard", authMiddleware, dashboard);
router.post("/logout", authMiddleware, logout);

export default router;