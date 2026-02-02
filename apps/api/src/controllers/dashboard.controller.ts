import { Request, Response } from "express";
import { getDashboardConfig } from "../services/dashboard.service";

export async function getDashboard(req: Request, res: Response) {
  const data = await getDashboardConfig();
  res.json(data);
}