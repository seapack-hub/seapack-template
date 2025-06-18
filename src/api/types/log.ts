export interface VisitStatsVO {
  /** 今日访客数(UV) */
  todayUvCount: number;
  /** 总访客数 */
  totalUvCount: number;
  /** 访客数同比增长率（相对于昨天同一时间段的增长率） */
  uvGrowthRate: number;
  label:string;
  icon:string;
  title:string;
}