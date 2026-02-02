import { Request, Response } from "express";
import * as svc from "../services/profile.service";


// Highlights
export const getHighlights = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const data = await svc.getHighlights(profileId);
  res.json(data);
};

export const putHighlights = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  await svc.upsertHighlights(profileId, req.body ?? []);
  res.status(204).end();
};

// About
export const getAbout = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const data = await svc.getAbout(profileId);
  res.json(data);
};

export const putAbout = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const { about } = req.body ?? {};
  const data = await svc.setAbout(profileId, about ?? null);
  res.json({ about: data.about });
};

// Experiences
export const getExperiences = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const items = await svc.listExperiences(profileId);
  res.json(items);
};

export const postExperience = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  const saved = await svc.saveExperience(profileId, req.body);
  res.json(saved);
};

export const deleteExperience = async (req: Request, res: Response) => {
  await svc.deleteExperience(req.params.id);
  res.status(204).end();
};

export const getTechSuggestions = async (_: Request, res: Response) => {
  res.json(await svc.listTechSuggestions());
};

// Languages
export const getLanguages = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  res.json(await svc.listLanguages(profileId));
};

export const putLanguages = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  await svc.setLanguages(profileId, req.body ?? []);
  res.status(204).end();
};

// Contacts
export const getContacts = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  res.json(await svc.listContacts(profileId));
};

export const putContacts = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  await svc.setContacts(profileId, req.body ?? []);
  res.status(204).end();
};

// Skills
export const getSkills = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  res.json(await svc.listSkills(profileId));
};

export const putSkills = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  await svc.setSkills(profileId, req.body ?? []);
  res.status(204).end();
};

export const deleteSkill = async (req: Request, res: Response) => {
  await svc.deleteSkill(req.params.id);
  res.status(204).end();
};

// Reviews
export const getReviews = async (req: Request, res: Response) => {
  const { profileId } = req.params;
  res.json(await svc.listReviews(profileId));
};

export const deleteReviews = async (req: Request, res: Response) => {
  await svc.deleteReviews(req.params.id);
  res.status(204).end();
}