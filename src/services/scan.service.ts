import { spawn } from "child_process"
import path from "path"
import { promises as fs } from "fs"

import { IScan } from "../interfaces/scan.interface"
import { scanModel } from "../models/scan.model"

class ScanService {
  async getScans(userId: string | null) {
    return await scanModel.find({ userId: userId }).sort({ createdAt: -1 })
  }

  async getScanById(userId: string, scanId: string) {
    return await scanModel.findOne({ userId: userId, _id: scanId })
  }

  async createScan(scanData: IScan) {
    const scan = new scanModel(scanData)
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

      python.stderr.on("data", (data) => {
        console.error(`Error: ${data}`)
      })

      python.on("close", (code) => {
        if (code === 1) {
          console.log(`ZAP scan failed with exit code ${code}`)
          resolve()
        }
      })
    })
  }

  async readOutputFile(userId: string, scanId: string) {
    const outputPath = path.resolve(
      __dirname,
      `../../output/${userId}-${scanId}-report.json`
    )
    const data = await fs.readFile(outputPath, "utf-8")
    return JSON.parse(String(data))
  }
}

export const scanService = new ScanService()
