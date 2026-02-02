import { Request, Response } from "express";
import { educationService } from "../services/education.service";

export const educationController = {
  async list(req: Request, res: Response) {
    const { profileId } = req.params;
    const rows = await educationService.listByProfile(profileId);
    res.json(rows);
  },

  async create(req: Request, res: Response) {
    const { profileId } = req.params;
    const row = await educationService.create(profileId, req.body);
    res.json(row);
  },

  async update(req: Request, res: Response) {
    const { profileId, id } = req.params;
    // Optional: validate row belongs to profileId before update
    const row = await educationService.update(id, profileId, req.body);
    res.json(row);
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    await educationService.remove(id);
    res.json({ ok: true });
  },
};