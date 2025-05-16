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
      res.json({ scans: [] })
      return
    }

    const scansWithVulns = await Promise.all(
      scans.map(async (scan) => {
        const vulns = await vulnerabilityService.getVulns(
          String(userId),
          String(scan._id)
        )

        return {
          ...scan.toObject(),
          vulns: vulns.map((vuln)=> {
            return{
              name: vuln.name,
              description: vuln.description,
              severity: vuln.severity,
              mitigation: vuln.mitigation,
              cwe: vuln.cwe,
              createdAt: vuln.createdAt,
            }
          }),
        }
      })
    )

    res.json({ scans: scansWithVulns })
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
        const responseData = {
          statistics: {},
          vulns: [],
          scanData: {},
        }
        res.json(responseData)
        return
      }

      const vulnerabilties = await vulnerabilityService.getVulns(
        userId,
        String(scan[0]._id)
      )

      const countInfoVulns = await vulnerabilityService.countVulns(
        String(userId),
        String(scan[0]._id),
        "informational"
      )
      const countLowVulns = await vulnerabilityService.countVulns(
        String(userId),
        String(scan[0]._id),
        "low"
      )
      const countMedfiumVulns = await vulnerabilityService.countVulns(
        String(userId),
        String(scan[0]._id),
        "medium"
      )
      const countHighVulns = await vulnerabilityService.countVulns(
        String(userId),
        String(scan[0]._id),
        "high"
      )

      const responseData = {
        statistics: {
          informational: countInfoVulns,
          low: countLowVulns,
          medium: countMedfiumVulns,
          high: countHighVulns,
        },
        vulns: vulnerabilties,
        scanData: {
          _id: scan[0]._id,
          userId: scan[0].userId,
          typeScan: scan[0].typeScan,
          createdAt: scan[0].createdAt,
          updatedAt: scan[0].updatedAt,
          target: scan[0].target,
        },
      }

      res.json(responseData)
      return
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
        target: target,
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

      const countInfoVulns = await vulnerabilityService.countVulns(
        String(userId),
        newScan._id.toString(),
        "informational"
      )
      const countLowVulns = await vulnerabilityService.countVulns(
        String(userId),
        newScan._id.toString(),
        "low"
      )
      const countMedfiumVulns = await vulnerabilityService.countVulns(
        String(userId),
        newScan._id.toString(),
        "medium"
      )
      const countHighVulns = await vulnerabilityService.countVulns(
        String(userId),
        newScan._id.toString(),
        "high"
      )

      const responseData = {
        statistics: {
          informational: countInfoVulns,
          low: countLowVulns,
          medium: countMedfiumVulns,
          high: countHighVulns,
        },
        vulns: readAndSaveVulns,
        scanData: {
          _id: newScan._id,
          userId: newScan.userId,
          typeScan: newScan.typeScan,
          createdAt: newScan.createdAt,
          updatedAt: newScan.updatedAt,
          target: newScan.target,
        },
      }

      res.json(responseData)
      return
    } catch (error) {
      console.error("Error executing scan:", error)
      res.status(500).json({ error: "Failed to execute scan" })
    }
  }
)

export default router
