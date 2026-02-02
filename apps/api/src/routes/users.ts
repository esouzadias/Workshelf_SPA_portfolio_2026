import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middlewares/auth.middleware";
import { Gender, MaritalStatus, EmploymentStatus } from "@prisma/client";

const router = Router();

// GET /users/me 
router.get("/me", requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          hobbies: { select: { id: true, name: true, description: true, icon: true } },
        },
      },
    },
  });
  if (!user) return res.status(404).json({ error: "User não encontrado" });

  res.json({ id: user.id, email: user.email, profile: user.profile });
});

// GET /users/profile-options
router.get("/profile-options", requireAuth, async (_req, res) => {
  res.json({
    gender: Object.values(Gender),
    maritalStatus: Object.values(MaritalStatus),
    employmentStatus: Object.values(EmploymentStatus),
  });
});

/**
 * @swagger
 * /users/avatar:
 *   delete:
 *     tags: [Users]
 *     summary: Remove user avatar (reset to default)
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Avatar removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       401:
 *         description: Unauthorized
 */
router.delete("/avatar", requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;

  await prisma.profile.update({
    where: { userId },
    data: { avatarUrl: null }, // reset
  });

  res.json({ ok: true });
});

/**
 * @swagger
 * /users/avatar:
 *   put:
 *     tags: [Profile]
 *     summary: update user
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: New user added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;
  const { displayName, theme, locale, avatarUrl, currentCompanyLogoUrl, currentClientLogoUrl, schoolLogoUrl, degreeIcon } = req.body || {};

  if (
    displayName == null &&
    theme == null &&
    locale == null &&
    avatarUrl == null &&
    currentCompanyLogoUrl == null &&
    currentClientLogoUrl == null
  ) {
    return res.status(400).json({ error: "Nada para atualizar" });
  }

  let data: any = { displayName, theme, locale, currentCompanyLogoUrl, currentClientLogoUrl, schoolLogoUrl, degreeIcon };

  if (typeof avatarUrl === "string" && avatarUrl.startsWith("data:image/")) {
    if (avatarUrl.length > 1_500_000) {
      return res.status(413).json({ error: "Imagem demasiado grande" });
    }
    data.avatarUrl = avatarUrl;
  }

  if (
    typeof currentCompanyLogoUrl === "string" &&
    currentCompanyLogoUrl.startsWith("data:image/")
  ) {
    if (currentCompanyLogoUrl.length > 1_500_000) {
      return res.status(413).json({ error: "Imagem demasiado grande" });
    }
    data.currentCompanyLogoUrl = currentCompanyLogoUrl;
  }

  if (
    typeof currentClientLogoUrl === "string" &&
    currentClientLogoUrl.startsWith("data:image/")
  ) {
    if (currentClientLogoUrl.length > 1_500_000) {
      return res.status(413).json({ error: "Imagem demasiado grande" });
    }
    data.currentClientLogoUrl = currentClientLogoUrl;
  }

  try {
    const updated = await prisma.profile.update({
      where: { userId },
      data,
    });
    res.json(updated);
  } catch (_e) {
    res.status(500).json({ error: "Erro a atualizar perfil" });
  }
});

// GET /users/by-email?email=alguem@example.com
/**
 * @swagger
 * /users/avatar:
 *   get:
 *     tags: [Users]
 *     summary: Get user by email
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: User by email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok: { type: boolean, example: true }
 *       401:
 *         description: Unauthorized
 */
router.get("/by-email", requireAuth, async (req, res) => {
  const email = String(req.query.email || "");
  if (!email) return res.status(400).json({ error: "Falta o email" });

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      createdAt: true,
      profile: { select: { displayName: true, theme: true, locale: true } }
    }
  });

  if (!user) return res.status(404).json({ error: "User não encontrado" });
  res.json(user);
});

// GET/users/:id  -> obter info pública de um user (id, displayName)
router.get("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Falta o id" });

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      createdAt: true,
      profile: { select: { displayName: true, theme: true, locale: true } }
    }
  });

  if (!user) return res.status(404).json({ error: "User não encontrado" });
  res.json(user);
});

router.get("/tiles/profile", requireAuth, async (req, res) => {
  const userId = (req as any).userId as string;
  const p = await prisma.profile.findUnique({ where: { userId } });
  if (!p) return res.status(404).json({ error: "Profile não encontrado" });

  const yearsBetween = (from?: Date | null, to = new Date()) => {
    if (!from) return null;
    const ms = to.getTime() - from.getTime();
    const years = ms / (1000 * 60 * 60 * 24 * 365.2425);
    // 1 casa decimal (ex.: 2.4y)
    return Math.round(years * 10) / 10;
  };

  const age = yearsBetween(p.birthDate);
  const yearsInCurrentRole = yearsBetween(p.currentRoleStart);

  res.json({
    fullName: p.fullName ?? p.displayName,
    age,                       // ex.: 31.2
    maritalStatus: p.maritalStatus,         // ex.: "single"
    employmentStatus: p.employmentStatus,   // ex.: "employed"
    currentTitle: p.currentTitle,           // ex.: "Frontend Engineer"
    yearsInCurrentRole,                     // ex.: 2.4
  });
});

/**
 * @swagger
 * /api/profile/{profileId}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: List reviews for a profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema:
 *           type: string
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 */

export default router;