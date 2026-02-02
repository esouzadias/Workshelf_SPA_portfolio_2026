import { Router } from "express";
import { educationController } from "../controllers/education.controller";

const router = Router();

// Same style as your other routes:
router.get("/api/profile/:profileId/educations", educationController.list);
router.post("/api/profile/:profileId/educations", educationController.create);
router.put("/api/profile/:profileId/educations/:id", educationController.update);
router.delete("/api/profile/:profileId/educations/:id", educationController.remove);

export default router;