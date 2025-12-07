// api/statistics/overview.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("✅ GET /api/statistics/overview");
  
  return res.json({ 
    systemHealth: 98, 
    activeUsers: 120, 
    connectedSchools: 5, 
    responseTimeMsP95: 120, 
    resourcesUsage: { cpu: 35, memory: 48 }, 
    engagement: { dailyActive: 80, weeklyActive: 220 }, 
    errorsLastHour: 1 
  });
}

