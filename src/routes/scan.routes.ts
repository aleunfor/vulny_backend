import { Router, Request, Response } from "express"
import { requireAuth, getAuth } from "@clerk/express"

import { scanService } from "../services/scan.service"
import { vulnerabilityService } from "../services/vulnerability.service"

import { IScan } from "src/interfaces/scan.interface"
import { Types } from "mongoose"

const router = Router()
const prefix = "/api/scans"

router.get(`${prefix}`, requireAuth(), async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      console.error("User ID not found in request")
      res.status(401).json({ message: "Unauthorized" })
      return
    }

    const scans = await scanService.getScans(userId)
    if (!scans.length) {
      res.status(404).json({ error: "Scans not found" })
      return
    }

    res.json({ scans: scans })
    return
  } catch (error) {
    console.error("Error fetching scans:", error)
    res.status(500).json({ error: "Failed to fetch scans" })
    return
  }
})

router.get(`${prefix}/:userId/:scanId`, async (req: Request, res: Response) => {
  const { userId, scanId } = req.params

  const scan = await scanService.getScanById(userId, scanId)
  if (!scan) {
    res.status(404).json({ error: "Scan not found" })
  }

  res.json({ scan: scan })
})

router.get(
  `${prefix}/last`,
  requireAuth(),
  async (req: Request, res: Response) => {
    try {
      const { userId } = getAuth(req)

      const scan = await scanService.getScans(String(userId))
      if (!scan.length) {
        res.status(404).json({ error: "Scan not found" })
        return
      }

      const vulnerabilties = await vulnerabilityService.getVulns(
        userId,
        String(scan[0]._id)
      )

      res.json({ vulns: vulnerabilties })
    } catch (error) {
      console.error("Error fetching last scan:", error)
      res.status(500).json({ error: "Failed to fetch last scan" })
      return
    }
  }
)

router.post(
  `${prefix}/execute`,
  requireAuth(),
  async (req: Request, res: Response) => {
    try {
      const { target } = req.body
      const { userId } = getAuth(req)

      if (!userId) {
        console.error("User ID not found in request")
        res.status(401).json({ message: "Unauthorized" })
        return
      }

      if (!target) {
        console.error("Target not found in request")
        res.status(400).json({ error: "Missing target" })
        return
      }

      const newScan = {
        _id: new Types.ObjectId(),
        userId: userId,
        typeScan: "active",
      } as IScan

      await scanService.createScan(newScan)
      await scanService.executeScan(
        String(userId),
        newScan._id.toString(),
        target
      )
      const outputData = await scanService.readOutputFile(
        String(userId),
        newScan._id.toString()
      )
      const readAndSaveVulns = await vulnerabilityService.readAndSaveVulns(
        String(userId),
        newScan._id.toString(),
        outputData
      )

      res.json({ vulns: readAndSaveVulns })
    } catch (error) {
      console.error("Error executing scan:", error)
      res.status(500).json({ error: "Failed to execute scan" })
    }
  }
)

export default router
