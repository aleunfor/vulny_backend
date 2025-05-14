import { spawn } from "child_process"
import path from "path"

import { scanModel } from "../models/scan.model"

class ScanService {
  async getScans(userId: string) {
    return await scanModel.find({ userId: userId }).sort({ createdAt: -1 })
  }

  async getScanById(userId: string, scanId: string) {
    return await scanModel.findOne({ userId: userId, _id: scanId })
  }

  async createScan(userId: string, typeScan: string) {
    const scan = new scanModel({ userId, typeScan })
    return await scan.save()
  }

  executeScan(userId: string, scanId: string, target: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.resolve(__dirname, "../scripts/scan.py")
      const python = spawn("python", [
        scriptPath,
        "--target",
        target,
        "--userid",
        userId,
        "--scanid",
        scanId,
      ])

      python.stdout.on("data", (data) => {
        console.log(`🟢 Output: ${data}`)
      })

      python.stderr.on("data", (data) => {
        console.error(`🔴 Error: ${data}`)
      })

      python.on("close", (code) => {
        if (code === 1) {
          console.log(`ZAP scan failed with exit code ${code}`)
          resolve()
        }
      })
    })
  }
}

export const scanService = new ScanService()
