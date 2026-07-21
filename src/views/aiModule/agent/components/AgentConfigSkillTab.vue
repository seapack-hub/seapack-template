<template>
  <div class="min-h-300px">
    <div class="flex items-center justify-between mb-8px">
      <span class="text-14px font-600">关联技能</span>
      <el-button type="primary" size="small" @click="openAddSkill">添加技能</el-button>
    </div>
    <SpTable :data="skills" :columns="skillColumns" :show-index="true" size="small">
      <template #isPrimary>
        <el-table-column label="类型" prop="isPrimary" width="80" align="center" slot-name="isPrimary">
          <template #default="{ row }">
            <el-tag :type="row.isPrimary === 1 ? 'danger' : 'info'" size="small">{{ row.isPrimary === 1 ? '主技能' : '辅助' }}</el-tag>
          </template>
        </el-table-column>
      </template>
      <template #enabled>
        <el-table-column label="状态" prop="enabled" width="70" align="center" slot-name="enabled">
          <template #default="{ row }">
            <el-switch :model-value="row.enabled" :active-value="1" :inactive-value="0" size="small" @change="(val) => toggleSkillEnabled(row, val as number)" />
          </template>
        </el-table-column>
      </template>
      <template #operate>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="editSkill(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="removeSkill(row)">删除</el-button>
          </template>
        </el-table-column>
      </template>
    </SpTable>

    <el-dialog v-model="skillDialogVisible" :title="skillFormIsEdit ? '编辑关联技能' : '添加关联技能'" width="420px" append-to-body>
      <el-form :model="skillForm" label-width="80px">
        <el-form-item label="技能">
          <el-select v-model="skillForm.skillId" placeholder="选择技能" style="width: 100%" :disabled="skillFormIsEdit">
            <el-option v-for="s in allSkills" :key="s.id" :label="s.name" :value="s.id as number" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="skillForm.isPrimary">
            <el-radio :value="1">主技能</el-radio>
            <el-radio :value="0">辅助技能</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序号">
          <el-input-number v-model="skillForm.sortOrder" :min="0" :max="999" style="width: 100%" />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="skillForm.enabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="skillDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSkillSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { AgentAPI, type AgentSkill } from '@/api/ai/agent'
import type { Skill } from '@/api/ai/skill'
import { AGENT_SKILL_COLUMNS } from '../utils/tableColumns'

const props = defineProps<{
  agentId: number
  allSkills: Skill[]
}>()

const skills = ref<AgentSkill[]>([])
const skillColumns = [...AGENT_SKILL_COLUMNS]

// ===== 关联技能管理 =====
const skillDialogVisible = ref(false)
const skillFormIsEdit = ref(false)
const skillForm = ref<Partial<AgentSkill>>({ skillId: undefined, isPrimary: 0, sortOrder: 0, enabled: 1 })

function openAddSkill() {
  skillFormIsEdit.value = false
  skillForm.value = { skillId: undefined, isPrimary: 0, sortOrder: 0, enabled: 1 }
  skillDialogVisible.value = true
}

function editSkill(row: AgentSkill) {
  skillFormIsEdit.value = true
  skillForm.value = { ...row }
  skillDialogVisible.value = true
}

async function onSkillSubmit() {
  if (!skillForm.value.skillId) { ElMessage.warning('请选择技能'); return }
  if (skillFormIsEdit.value && skillForm.value.id) {
    await AgentAPI.updateSkill(props.agentId, skillForm.value.id, skillForm.value)
  } else {
    await AgentAPI.addSkill(props.agentId, skillForm.value)
  }
  ElMessage.success('操作成功')
  skillDialogVisible.value = false
  await loadSkills()
}

async function removeSkill(row: AgentSkill) {
  await ElMessageBox.confirm('确认删除该关联技能？', '提示', { type: 'warning' })
  await AgentAPI.deleteSkill(props.agentId, row.id!)
  ElMessage.success('删除成功')
  await loadSkills()
}

async function toggleSkillEnabled(row: AgentSkill, val: number) {
  await AgentAPI.updateSkill(props.agentId, row.id!, { enabled: val })
  row.enabled = val
}

async function loadSkills() {
  skills.value = await AgentAPI.getSkills(props.agentId) || []
}

defineExpose({ loadSkills })
</script>
