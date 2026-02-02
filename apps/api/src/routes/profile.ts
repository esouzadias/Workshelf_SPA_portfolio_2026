import { Router } from "express";
import * as ctl from "../controllers/profile.controllers";
import { requireAuth } from "../middlewares/auth.middleware";

const r = Router();
r.use(requireAuth);

/**
 * @swagger
 * /api/profile/{profileId}/highlights:
 *   get:
 *     tags: [Profile]
 *     summary: Get profile highlights
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Highlights list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ProfileHighlight' }
 *       401:
 *         description: Unauthorized
 */
r.get("/:profileId/highlights", ctl.getHighlights);

/**
 * @swagger
 * /api/profile/{profileId}/highlights:
 *   put:
 *     tags: [Profile]
 *     summary: Upsert profile highlights (replace list)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items: { $ref: '#/components/schemas/ProfileHighlight' }
 *     responses:
 *       204:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 */
r.put("/:profileId/highlights", ctl.putHighlights);

/**
 * @swagger
 * /api/profile/{profileId}/about:
 *   get:
 *     tags: [Profile]
 *     summary: Get profile about text
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: About text
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 about: { type: string, nullable: true }
 *       401:
 *         description: Unauthorized
 */
r.get("/:profileId/about", ctl.getAbout);

/**
 * @swagger
 * /api/profile/{profileId}/about:
 *   put:
 *     tags: [Profile]
 *     summary: Set profile about text
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               about: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Updated about
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 about: { type: string, nullable: true }
 *       401:
 *         description: Unauthorized
 */
r.put("/:profileId/about", ctl.putAbout);

/**
 * @swagger
 * /api/profile/{profileId}/experiences:
 *   get:
 *     tags: [Experience]
 *     summary: List experiences for a profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Experiences list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Experience' }
 *       401:
 *         description: Unauthorized
 */
r.get("/:profileId/experiences", ctl.getExperiences);

/**
 * @swagger
 * /api/profile/{profileId}/experiences:
 *   post:
 *     tags: [Experience]
 *     summary: Create or update an experience
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Experience' }
 *     responses:
 *       200:
 *         description: Saved experience
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Experience' }
 *       401:
 *         description: Unauthorized
 */
r.post("/:profileId/experiences", ctl.postExperience);

/**
 * @swagger
 * /api/profile/experiences/{id}:
 *   delete:
 *     tags: [Experience]
 *     summary: Delete an experience by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 */
r.delete("/experiences/:id", ctl.deleteExperience);

/**
 * @swagger
 * /api/profile/tech/suggest:
 *   get:
 *     tags: [Technology]
 *     summary: Get technology suggestions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suggestions list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Technology' }
 *       401:
 *         description: Unauthorized
 */
r.get("/tech/suggest", ctl.getTechSuggestions);

/**
 * @swagger
 * /api/profile/{profileId}/languages:
 *   get:
 *     tags: [Profile]
 *     summary: List languages for a profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Languages list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Language' }
 *       401:
 *         description: Unauthorized
 */
r.get("/:profileId/languages", ctl.getLanguages);

/**
 * @swagger
 * /api/profile/{profileId}/languages:
 *   put:
 *     tags: [Profile]
 *     summary: Set languages for a profile (replace list)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items: { $ref: '#/components/schemas/Language' }
 *     responses:
 *       204:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 */
r.put("/:profileId/languages", ctl.putLanguages);

/**
 * @swagger
 * /api/profile/{profileId}/contacts:
 *   get:
 *     tags: [Profile]
 *     summary: List contact methods for a profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Contact methods list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ContactMethod' }
 *       401:
 *         description: Unauthorized
 */
r.get("/:profileId/contacts", ctl.getContacts);

/**
 * @swagger
 * /api/profile/{profileId}/contacts:
 *   put:
 *     tags: [Profile]
 *     summary: Set contact methods for a profile (replace list)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items: { $ref: '#/components/schemas/ContactMethod' }
 *     responses:
 *       204:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 */
r.put("/:profileId/contacts", ctl.putContacts);

/**
 * @swagger
 * /api/profile/{profileId}/skills:
 *   get:
 *     tags: [Skills]
 *     summary: List skills for a profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Skills list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Skill' }
 *       401:
 *         description: Unauthorized
 */
r.get("/:profileId/skills", ctl.getSkills);

/**
 * @swagger
 * /api/profile/{profileId}/skills:
 *   put:
 *     tags: [Skills]
 *     summary: Set skills for a profile (replace list)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: profileId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items: { $ref: '#/components/schemas/Skill' }
 *     responses:
 *       204:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 */
r.put("/:profileId/skills", ctl.putSkills);

/**
 * @swagger
 * /api/profile/skills/{id}:
 *   delete:
 *     tags: [Skills]
 *     summary: Delete a skill by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 */
r.delete("/skills/:id", ctl.deleteSkill);

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
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Review' }
 *       401:
 *         description: Unauthorized
 */
r.get("/:profileId/reviews", ctl.getReviews);

/**
 * @swagger
 * /api/profile/reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete a review by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 */
r.delete("/reviews/:id", ctl.deleteReviews);

export default r;