/**
 * 储备资产看板 — 类型定义
 */

export interface RaOverview {
  date: string
  fxUsd: number;        fxUsdChange: number
  fxSdr: number;        fxSdrChange: number
  imfUsd: number;       imfUsdChange: number
  sdrUsd: number;       sdrUsdChange: number
  goldUsd: number;      goldUsdChange: number
  goldOz: number;       goldOzChange: number
  totalUsd: number
  goldPct: number
  alerts: RaAlert[]
}

export interface RaAlert {
  name: string
  color: string
  desc: string
}

export interface RaTrend {
  dates: string[]
  forexUsd: number[]
  forexSdr: number[]
  imfUsd: number[]
  sdrUsd: number[]
  goldUsd: number[]
  goldOz: number[]
}

export interface RaDetailRow {
  date: string
  forexUsd: number
  forexSdr: number
  imfUsd: number
  sdrUsd: number
  goldUsd: number
  goldOz: number
}

export interface RaDetail {
  total: number
  records: RaDetailRow[]
}
