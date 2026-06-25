/**
 * index.vue —— AI 图片生成页面
 *
 * 提供文生图功能的交互界面：
 *   - 提示词输入 + 参数配置（尺寸、风格）
 *   - 图片生成展示（画廊网格布局）
 *   - 点击预览大图、下载到本地
 *   - 生成历史记录
 */

<template>
  <div class="image-gen-container">
    <!-- 顶部说明 -->
    <el-card shadow="never" class="header-card">
      <div class="header-content">
        <el-icon :size="24" color="#409eff"><Picture /></el-icon>
        <div>
          <h3>AI 图片生成</h3>
          <p class="desc">输入文本描述，AI 将根据提示词生成对应的图片</p>
        </div>
      </div>
    </el-card>

    <div class="main-layout">
      <!-- 左侧：输入区 + 参数配置 -->
      <div class="input-panel">
        <el-card shadow="never">
          <template #header>
            <span>提示词配置</span>
          </template>

          <!-- 提示词输入 -->
          <el-input
            v-model="prompt"
            type="textarea"
            :rows="5"
            placeholder="请输入图片描述，如：一只橘猫在阳光下打盹，写实风格，4K..."
            :disabled="isGenerating"
            resize="none"
          />

          <div class="param-row">
            <!-- 尺寸选择 -->
            <div class="param-item">
              <label class="param-label">图片尺寸</label>
              <el-select v-model="size" size="default" :disabled="isGenerating">
                <el-option label="方形 1024×1024" value="1024x1024" />
                <el-option label="横版 1792×1024" value="1792x1024" />
                <el-option label="竖版 1024×1792" value="1024x1792" />
              </el-select>
            </div>

            <!-- 风格选择 -->
            <div class="param-item">
              <label class="param-label">图片风格</label>
              <el-select v-model="style" size="default" :disabled="isGenerating">
                <el-option label="生动 vivid" value="vivid" />
                <el-option label="自然 natural" value="natural" />
              </el-select>
            </div>
          </div>

          <!-- 生成按钮 -->
          <el-button
            type="primary"
            size="large"
            class="generate-btn"
            :loading="isGenerating"
            :icon="MagicStick"
            @click="handleGenerate"
          >
            {{ isGenerating ? '生成中...' : '生成图片' }}
          </el-button>
        </el-card>

        <!-- 生成历史 -->
        <el-card shadow="never" class="history-card">
          <template #header>
            <span>生成历史</span>
          </template>
          <el-scrollbar max-height="300px">
            <div v-if="historyList.length === 0" class="empty-hint">暂无生成记录</div>
            <div
              v-for="(item, index) in historyList"
              :key="index"
              class="history-item"
              @click="previewUrl = item"
            >
              <el-image
                :src="item"
                fit="cover"
                class="history-thumb"
                loading="lazy"
              />
              <el-icon class="history-preview-icon"><ZoomIn /></el-icon>
            </div>
          </el-scrollbar>
        </el-card>
      </div>

      <!-- 右侧：图片画廊 -->
      <div class="gallery-panel">
        <el-card shadow="never" class="gallery-card">
          <template #header>
            <span>生成结果</span>
            <el-button
              v-if="generatedImages.length > 0"
              text
              type="primary"
              size="small"
              :icon="Download"
              @click="handleDownloadAll"
            >
              全部下载
            </el-button>
          </template>

          <!-- 空状态 -->
          <div v-if="generatedImages.length === 0 && !isGenerating" class="empty-gallery">
            <el-icon :size="64" color="#dcdfe6"><PictureFilled /></el-icon>
            <p>输入提示词并点击生成</p>
          </div>

          <!-- 加载骨架 -->
          <div v-if="isGenerating" class="skeleton-grid">
            <div v-for="n in 4" :key="n" class="skeleton-item">
              <el-skeleton animated>
                <template #template>
                  <el-skeleton-item variant="image" style="width: 100%; height: 240px" />
                </template>
              </el-skeleton>
            </div>
          </div>

          <!-- 图片网格 -->
          <div v-if="!isGenerating && generatedImages.length > 0" class="image-grid">
            <div
              v-for="(url, index) in generatedImages"
              :key="index"
              class="image-item"
            >
              <el-image
                :src="url"
                fit="cover"
                class="gallery-image"
                :preview-src-list="generatedImages"
                :initial-index="index"
                preview-teleported
              />
              <div class="image-overlay">
                <el-button
                  text
                  size="small"
                  :icon="Download"
                  @click="handleDownload(url)"
                />
                <el-button
                  text
                  size="small"
                  :icon="Refresh"
                  @click="handleRegenerate"
                />
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 历史图片大图预览 -->
    <el-image-viewer
      v-if="previewUrl"
      :url-list="[previewUrl]"
      @close="previewUrl = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Picture, MagicStick, Download, Refresh, ZoomIn, PictureFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { imageApi } from '@/api/ai/image';

// ===== 表单状态 =====
const prompt = ref('');
const size = ref<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024');
const style = ref<'vivid' | 'natural'>('vivid');
const isGenerating = ref(false);

// ===== 图片展示状态 =====
const generatedImages = ref<string[]>([]);
const historyList = ref<string[]>([]);
const previewUrl = ref('');

/**
 * 生成图片
 */
async function handleGenerate() {
  if (!prompt.value.trim()) {
    ElMessage.warning('请输入图片描述');
    return;
  }

  isGenerating.value = true;
  try {
    const urls = await imageApi.generateImage({
      prompt: prompt.value,
      n: 4,
      size: size.value,
      style: style.value,
    });
    generatedImages.value = urls;
    // 加入历史记录（去重）
    urls.forEach((url) => {
      if (!historyList.value.includes(url)) {
        historyList.value.unshift(url);
      }
    });
    // 最多保留 20 条历史
    if (historyList.value.length > 20) {
      historyList.value = historyList.value.slice(0, 20);
    }
    ElMessage.success(`已生成 ${urls.length} 张图片`);
  } catch (err: any) {
    ElMessage.error(`生成失败: ${err.message}`);
  } finally {
    isGenerating.value = false;
  }
}

/**
 * 重新生成（使用相同提示词）
 */
function handleRegenerate() {
  handleGenerate();
}

/**
 * 下载单张图片
 */
function handleDownload(url: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = `ai-image-${Date.now()}.png`;
  link.click();
}

/**
 * 全部下载
 */
function handleDownloadAll() {
  generatedImages.value.forEach((url, index) => {
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-image-${Date.now()}-${index}.png`;
      link.click();
    }, index * 500); // 间隔 500ms 避免浏览器拦截
  });
  ElMessage.success('正在下载全部图片');
}
</script>

<style scoped lang="scss">
.image-gen-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.header-card {
  flex-shrink: 0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.desc {
  margin: 0;
  font-size: 13px;
  color: #909399;
}

.main-layout {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.input-panel {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex-shrink: 0;
}

.param-row {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.param-item {
  flex: 1;
}

.param-label {
  display: block;
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}

.generate-btn {
  width: 100%;
  margin-top: 12px;
}

.history-card {
  flex: 1;
  overflow: hidden;
}

.history-item {
  position: relative;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.02);
    .history-preview-icon { opacity: 1; }
  }
}

.history-thumb {
  width: 100%;
  height: 80px;
  display: block;
}

.history-preview-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 24px;
  opacity: 0;
  transition: opacity 0.15s;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.empty-hint {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 20px 0;
}

.gallery-panel {
  flex: 1;
  min-width: 0;
}

.gallery-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    flex: 1;
    overflow-y: auto;
  }
}

.empty-gallery {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #909399;
  gap: 12px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s;

  &:hover {
    transform: translateY(-2px);
    .image-overlay { opacity: 1; }
  }
}

.gallery-image {
  width: 100%;
  height: 240px;
  display: block;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.15s;

  .el-button {
    color: white;
  }
}

// 加载骨架网格
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.skeleton-item {
  height: 240px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
