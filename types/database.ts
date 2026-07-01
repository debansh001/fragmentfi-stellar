export type User = {
  id: string
  address: string
  createdAt: Date
}

export type Portfolio = {
  id: string
  userId: string
  fragBalance: number
  usdcValue: number
}

export type Transaction = {
  id: string
  userId: string
  type: string
  amount: number
  asset: string
  timestamp: Date
  txHash: string
}

export type YieldDistribution = {
  id: string
  amount: number
  timestamp: Date
  txHash: string
}
