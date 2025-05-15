import { Router, Request, Response } from "express"

import { scanService } from "../services/scan.service"
import { vulnerabilityService } from "../services/vulnerability.service"

import { IScan } from "src/interfaces/scan.interface"
import { Types } from "mongoose"

const router = Router()
const prefix = "/api/scans"

router.get(`${prefix}/:userId`, async (req: Request, res: Response) => {
  const { userId } = req.params

  const scans = await scanService.getScans(userId)
  if (!scans.length) {
    res.status(404).json({ error: "Scans not found" })
  }

  res.json({ scans: scans })
})

router.get(`${prefix}/:userId/:scanId`, async (req: Request, res: Response) => {
  const { userId, scanId } = req.params

  const scan = await scanService.getScanById(userId, scanId)
  if (!scan) {
    res.status(404).json({ error: "Scan not found" })
  }

  res.json({ scan: scan })
})

router.post(`${prefix}/execute`, async (req: Request, res: Response) => {
  try {
    const { userId, target } = req.body
    console.log(req.body)

    if (!userId || !target) {
      res.status(400).json({ error: "Missing userId or target" })
    }

    const newScan = {
      _id: new Types.ObjectId(),
      userId: userId,
      typeScan: "active",
    } as IScan

    await scanService.createScan(newScan)
    await scanService.executeScan(
      userId,
      newScan._id.toString(),
      target
    )
    const outputData = await scanService.readOutputFile(
      userId,
      newScan._id.toString()
    )
    const readAndSaveVulns = await vulnerabilityService.readAndSaveVulns(
      userId,
      newScan._id.toString(),
      outputData
    )

    res.json({ vulns: readAndSaveVulns })
  } catch (error) {
    console.error("Error executing scan:", error)
    res.status(500).json({ error: "Failed to execute scan" })
  }
})

export default router
