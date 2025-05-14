import { Schema } from "mongoose"
import mongoose from "mongoose"

import { IScan } from "src/interfaces/scan.interface"

const scanSchema = new Schema(
  {
    userId: { type: String, required: true },
    typeScan: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

export const scanModel = mongoose.model<IScan>("Scans", scanSchema, "scans")
