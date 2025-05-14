import { Router, Request, Response } from "express"

import { scanService } from "../services/scan.service"
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
  const { userId, target } = req.body

  const newScan = {
    _id: new Types.ObjectId(),
    userId: userId,
    typeScan: "active",
  } as IScan

  const executeScan = await scanService.executeScan(
    userId,
    newScan._id.toString(),
    target
  )

  res.json({ message: "Scan executed" })
})

export default router
