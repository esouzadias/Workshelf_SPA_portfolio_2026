import { Request, Response, NextFunction } from "express";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not Found" });
}

export function onError(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  res.status(err.status || 500).json({ error: "Internal Server Error" });
}