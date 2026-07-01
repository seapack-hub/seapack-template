/**
 * 技能管理模块 — 模块选项（从 modules.ts MODULE_DEFS 派生）
 * 用于模块绑定弹窗的下拉选择
 */
import { MODULE_DEFS } from '@/config/modules';

export const MODULE_OPTIONS = MODULE_DEFS.map(m => ({
  label: m.title,
  value: m.key,
}))
