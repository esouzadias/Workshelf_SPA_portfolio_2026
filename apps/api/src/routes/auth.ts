import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../db";
import { requireAuth } from "../middlewares/auth.middleware";
import crypto from "crypto";

const router = Router();
const JWT = process.env.JWT_SECRET || "change-me";

// helpers
function signAccess(sub: string) {
    return jwt.sign({ sub }, JWT, { expiresIn: "15m" }); // token curto
}

function sendErr(res: any, status: number, code: string, fallback: string) {
    return res.status(status).json({ errorCode: code, error: fallback });
}

function sha256(input: string) {
    return crypto.createHash("sha256").update(input).digest("hex");
}

function randomToken() {
    return crypto.randomBytes(32).toString("hex"); // 64 chars
}

// Register
/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, displayName]
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *               displayName:
 *                 type: string
 *                 example: Eric
 *     responses:
 *       201:
 *         description: Registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       409:
 *         description: Email already in use
 */
router.post("/register", async (req, res) => {
    const { email, password, displayName } = req.body || {};
    if (!email || !password || !displayName) {
        return sendErr(res, 400, "err.missing_fields", "email, password, displayName são obrigatórios");
    }
    const normEmail = String(email).toLowerCase().trim();

    const exists = await prisma.user.findUnique({ where: { email: normEmail } });
    if (exists) return sendErr(res, 409, "err.email_in_use", "Email já em uso");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
        data: {
            email: normEmail,
            passwordHash,
            profile: { create: { displayName } }
        },
        include: { profile: { include: { languages: true } } }
    });

    const access = signAccess(user.id);
    res.status(201).json({ access, user: { id: user.id, email: user.email, profile: user.profile } });
});

// POST /auth/forgot-password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body || {};
    if (!email) return sendErr(res, 400, "err.missing_fields", "email é obrigatório");

    const normEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normEmail } });

    // Sempre responde ok para não denunciar se existe ou não
    if (!user) return res.json({ ok: true });

    const rawToken = randomToken();
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    // opcional: invalidar tokens anteriores não usados
    await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
    });

    await prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            tokenHash,
            expiresAt,
        },
    });

    const devResetUrl = `http://localhost:3000/auth?mode=reset&token=${rawToken}`;
    return res.json({ ok: true, devResetUrl });
});

// POST /auth/reset-password
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return sendErr(res, 400, "err.missing_fields", "Campos obrigatórios");

    const tokenHash = sha256(String(token));
    const now = new Date();

    const row = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    });

    if (!row) return sendErr(res, 400, "err.invalid_token", "Token inválido");
    if (row.usedAt) return sendErr(res, 400, "err.invalid_token", "Token inválido");
    if (row.expiresAt <= now) return sendErr(res, 400, "err.token_expired", "Token expirado");

    const passwordHash = await bcrypt.hash(String(newPassword), 12);

    await prisma.$transaction([
        prisma.user.update({
            where: { id: row.userId },
            data: { passwordHash },
        }),
        prisma.passwordResetToken.update({
            where: { id: row.id },
            data: { usedAt: now },
        }),
    ]);

    return res.json({ ok: true });
});

// Login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: test@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthResponse"
 *       400:
 *         description: Missing fields
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/ErrorResponse" }
 *             examples:
 *               missing_fields:
 *                 summary: Campos obrigatórios em falta
 *                 value:
 *                   errorCode: err.missing_fields
 *                   error: "email e password são obrigatórios"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/ErrorResponse" }
 *             examples:
 *               invalid_credentials:
 *                 summary: Email ou password incorretos
 *                 value:
 *                   errorCode: err.invalid_credentials
 *                   error: "Credenciais inválidas"
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return sendErr(res, 400, "err.missing_fields", "email e password são obrigatórios");

    const normEmail = String(email).toLowerCase().trim();
    const user = await prisma.user.findUnique({
        where: { email: normEmail },
        include: { profile: { include: { languages: true } } }
    });
    if (!user) return sendErr(res, 401, "err.invalid_credentials", "Credenciais inválidas");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return sendErr(res, 401, "err.invalid_credentials", "Credenciais inválidas");

    const access = signAccess(user.id);
    res.json({ access, user: { id: user.id, email: user.email, profile: user.profile } });
});

// POST /auth/change-password
router.post("/change-password", requireAuth, async (req, res) => {
    const userId = (req as any).userId as string;
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) return sendErr(res, 400, "err.missing_fields", "Campos obrigatórios");
    /*  if (String(newPassword).length < 8)   return sendErr(res, 400, "err.password_too_short", "Password muito curta (mín. 8)"); */

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return sendErr(res, 404, "err.user_not_found", "User não encontrado");

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return sendErr(res, 401, "err.wrong_password", "Password atual incorreta");

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    res.json({ ok: true });
});

// POST /auth/change-email
router.post("/change-email", requireAuth, async (req, res) => {
    const userId = (req as any).userId as string;
    const { newEmail, password } = req.body || {};
    if (!newEmail || !password) return sendErr(res, 400, "err.missing_fields", "Campos obrigatórios");

    const email = String(newEmail).toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return sendErr(res, 404, "err.user_not_found", "User não encontrado");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return sendErr(res, 401, "err.invalid_credentials", "Credenciais inválidas");

    try {
        const updated = await prisma.user.update({ where: { id: userId }, data: { email } });
        res.json({ id: updated.id, email: updated.email });
    } catch (e: any) {
        // Prisma unique violation
        if (e.code === "P2002") return sendErr(res, 409, "err.email_in_use", "Email já em uso");
        res.status(500).json({ error: "Erro a atualizar email" });
    }
});

// Middleware simples de auth por Bearer token
/* function requireAuth(req: any, res: any, next: any) {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Sem token" });
    try {
        const payload = jwt.verify(token, JWT) as { sub: string };
        (req as any).userId = payload.sub;
        next();
    } catch {
        return res.status(401).json({ error: "Token inválido" });
    }
} */

// /me
/**
 * @swagger
/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Current user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 email: { type: string }
 *                 profile:
 *                   type: object
 *                   properties:
 *                     displayName: { type: string }
 *                     theme: { type: string, enum: ["system","light","dark"], nullable: true }
 *                     locale: { type: string, enum: ["en","pt"], nullable: true }
 *                     avatarUrl: { type: string, nullable: true }
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/ErrorResponse" }
 *             examples:
 *               no_token:
 *                 value: { errorCode: "err.unauthorized", error: "Sem token" }
 */
router.get("/me", requireAuth, async (req, res) => {
    const userId = (req as any).userId as string;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: { include: { languages: true } } }
    });
    if (!user) return res.status(404).json({ error: "User não encontrado" });
    res.json({ id: user.id, email: user.email, profile: user.profile });
});

export default router;