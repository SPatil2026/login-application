import { Request, Response } from "express";
import prisma from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../schemas/authSchemas";

const generateToken = (id: string, username: string) => {
    return jwt.sign({ id, username }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
    });
};

export const register = async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
    }

    const { username, email, password } = parsed.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        const token = generateToken(user.id, user.username);

        res.status(201).json({ token });
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(400).json({ error: "Email already exists" });
        }
        console.error("Register error:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
    }

    const { email, password } = parsed.data;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken(user.id, user.username);

        res.json({ token });
    } catch (error: any) {
        console.error("Login error:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const dashboard = async (req: Request, res: Response) => {
    res.json({
        message: `Welcome, ${req.user?.username}`,
    });
};

export const logout = async (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
};