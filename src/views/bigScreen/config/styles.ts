// 大屏主题色体系定义，支持多主题切换
export interface ScreenTheme {
  name: string           // 主题名称（中文）
  bgColor: string        // 全局背景色
  headerBg: string       // 顶栏背景（支持渐变）
  primaryColor: string   // 主色调（蓝色/绿色/金色）
  accentColor: string    // 辅助色（比主色略暗，用于视觉层次）
  textColor: string      // 主要文字颜色
  textSecondary: string  // 次要文字颜色
  borderColor: string    // 边框颜色（带透明度）
  cardBg: string         // 卡片背景（带透明度）
}

export const themes: Record<string, ScreenTheme> = {
  // 深蓝主题——默认，科技感最强
  darkBlue: {
    name: '深蓝',
    bgColor: '#0a0e17',
    headerBg: 'linear-gradient(90deg, #0a0e17 0%, #0f1a3a 50%, #0a0e17 100%)',
    primaryColor: '#00d4ff',
    accentColor: '#3a7bd5',
    textColor: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.65)',
    borderColor: 'rgba(0,212,255,0.25)',
    cardBg: 'rgba(0,212,255,0.05)',
  },
  // 深绿主题——偏环保/金融场景
  darkGreen: {
    name: '深绿',
    bgColor: '#0a140e',
    headerBg: 'linear-gradient(90deg, #0a140e 0%, #0f2a1a 50%, #0a140e 100%)',
    primaryColor: '#00ff88',
    accentColor: '#3ab57d',
    textColor: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.65)',
    borderColor: 'rgba(0,255,136,0.25)',
    cardBg: 'rgba(0,255,136,0.05)',
  },
  // 暗金主题——偏奢华/高端大屏
  darkGold: {
    name: '暗金',
    bgColor: '#14100a',
    headerBg: 'linear-gradient(90deg, #14100a 0%, #2a1f0f 50%, #14100a 100%)',
    primaryColor: '#ffb800',
    accentColor: '#b57d3a',
    textColor: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.65)',
    borderColor: 'rgba(255,184,0,0.25)',
    cardBg: 'rgba(255,184,0,0.05)',
  },
}

export const defaultTheme = themes.darkBlue
