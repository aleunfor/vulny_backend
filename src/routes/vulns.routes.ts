import { Router, Request, Response } from "express"

import { vulnerabilityService } from "../services/vulnerability.service"

const router = Router()
const prefix = "/api/vulns"

// Get vulns by scanId and userId
router.get(`${prefix}/:userId/:scanId`, async (req: Request, res: Response) => {
  const { userId, scanId } = req.params

  const vulns = await vulnerabilityService.getVulns(userId, scanId)
  if (!vulns.length) {
    res.status(404).json({ error: "Vulns not found" })
  }

  res.json({ vulns: vulns })
})

// Get vuln detail by vulnId and userId
router.get(`${prefix}/:userId/:scanId`, async (req: Request, res: Response) => {
  const { userId, scanId } = req.params

  const vuln = await vulnerabilityService.getVulnById(userId, scanId)
  if (!vuln) {
    res.status(404).json({ error: "Vulns not found" })
  }

  res.json({ vuln: vuln })
})

export default router
