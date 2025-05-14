import { Types } from "mongoose"

export interface IScan {
  _id: Types.ObjectId
  userId: string
  typeScan: string
  createdAt: Date
  updatedAt: Date
}
