/**
 * 股票基金模块公共常量
 *
 * 存放热门个股、分析维度等配置数据
 */

import type { QuickStock } from './StockCodeInput.vue';

/** 热门个股快捷选择 */
export const HOT_STOCKS: QuickStock[] = [
  { code: '600519', name: '贵州茅台', exchange: 'SH' },
  { code: '601398', name: '工商银行', exchange: 'SH' },
  { code: '600036', name: '招商银行', exchange: 'SH' },
  { code: '000858', name: '五粮液', exchange: 'SZ' },
  { code: '002415', name: '海康威视', exchange: 'SZ' },
  { code: '300750', name: '宁德时代', exchange: 'SZ' },
  { code: '000002', name: '万科A', exchange: 'SZ' },
  { code: '600900', name: '长江电力', exchange: 'SH' },
];

/** 个股诊断维度选项 */
export const ANALYZE_DIMENSIONS = [
  { label: '综合分析', value: 'all', desc: '技术面 + 基本面 + 分红 + 舆情' },
  { label: '技术面', value: 'technical', desc: 'K线形态、均线系统、量价关系' },
  { label: '基本面', value: 'fundamental', desc: '财务指标、盈利能力、估值水平' },
  { label: '分红分析', value: 'dividend', desc: '历史分红、股息率、分红稳定性' },
];
