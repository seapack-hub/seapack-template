/**
 * VoiceInputTip.vue —— 语音输入状态提示组件
 *
 * 在语音输入过程中提供实时的视觉反馈：
 *   - 录音中：脉冲动画 + 中间文本展示
 *   - 识别中：等待提示
 *   - 出错：错误信息展示
 */

<template>
  <transition name="voice-fade">
    <div v-if="visible" class="voice-tip" :class="`voice-tip--${status}`">
      <div class="voice-tip__content">
        <!-- 状态图标 -->
        <span class="voice-tip__icon">
          <template v-if="status === 'listening'">
            <span class="voice-pulse" />
            <el-icon color="#409eff" :size="18"><Microphone /></el-icon>
          </template>
          <el-icon v-else-if="status === 'recognizing'" color="#e6a23c" :size="18">
            <Loading />
          </el-icon>
          <el-icon v-else-if="status === 'error'" color="#f56c6c" :size="18">
            <WarningFilled />
          </el-icon>
        </span>

        <!-- 状态文本 -->
        <span class="voice-tip__text">
          <template v-if="status === 'listening'">
            <span class="voice-tip__listening">正在聆听...</span>
            <span v-if="interimText" class="voice-tip__interim">{{ interimText }}</span>
          </template>
          <span v-else-if="status === 'recognizing'">正在识别...</span>
          <span v-else-if="status === 'error'">{{ errorMessage }}</span>
        </span>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Microphone, Loading, WarningFilled } from '@element-plus/icons-vue';
import type { ListeningStatus } from '@/hooks/useSpeechRecognition';

const props = defineProps<{
  /** 语音识别状态 */
  status: ListeningStatus;
  /** 中间识别文本 */
  interimText: string;
  /** 错误信息 */
  errorMessage: string;
}>();

/** 是否显示提示组件 */
const visible = computed(() => props.status !== 'idle');
</script>

<style scoped lang="scss">
.voice-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  padding: 20px 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(8px);
  pointer-events: none;

  &__content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    position: relative;
  }

  &__text {
    font-size: 14px;
    color: #303133;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__listening {
    color: #409eff;
    font-weight: 500;
  }

  &__interim {
    font-size: 12px;
    color: #909399;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// 录音脉冲动画
.voice-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.15);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  50% { transform: scale(1.4); opacity: 0.2; }
  100% { transform: scale(0.8); opacity: 0.8; }
}

// 过渡动画
.voice-fade-enter-active,
.voice-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.voice-fade-enter-from,
.voice-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}
</style>
