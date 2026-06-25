/**
 * useSpeechRecognition —— 基于 Web Speech API 的语音识别 Hook
 *
 * 封装浏览器原生 SpeechRecognition 接口，提供语音输入的完整生命周期管理。
 * 无需额外依赖，Chrome/Edge 浏览器原生支持。
 *
 * 功能：
 *   - 开始/停止录音
 *   - 实时返回中间识别结果（interim）
 *   - 返回最终识别结果
 *   - 浏览器兼容性检测
 *   - 组件卸载时自动清理
 */

import { ref, onUnmounted } from 'vue';

/** 语音识别状态类型 */
export type ListeningStatus = 'idle' | 'listening' | 'recognizing' | 'error';

/**
 * useSpeechRecognition 返回值接口
 */
export interface UseSpeechRecognitionReturn {
  /** 当前浏览器是否支持 SpeechRecognition */
  isSupported: boolean;
  /** 当前语音状态: idle-闲置 / listening-录音中 / recognizing-识别中 / error-出错 */
  status: Ref<ListeningStatus>;
  /** 最终识别的文本结果（最后一次识别的完整文本） */
  transcript: Ref<string>;
  /** 实时的中间识别文本（用户说话过程中不断更新） */
  interimText: Ref<string>;
  /** 错误信息（发生错误时填充） */
  errorMessage: Ref<string>;
  /** 开始录音 */
  start: () => void;
  /** 停止录音 */
  stop: () => void;
  /** 切换录音/停止 */
  toggle: () => void;
}

/**
 * 语音识别回调配置
 */
interface SpeechRecognitionOptions {
  /** 识别结束后的回调，参数为最终文本 */
  onResult?: (text: string) => void;
  /** 发生错误时的回调 */
  onError?: (error: string) => void;
  /** 识别语言，默认 'zh-CN' */
  lang?: string;
  /** 是否返回中间结果，默认 true */
  interimResults?: boolean;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const {
    onResult,
    onError,
    lang = 'zh-CN',
    interimResults = true,
  } = options;

  // 检测浏览器兼容性
  const SpeechRecognitionConstructor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSupported = !!SpeechRecognitionConstructor;

  // ===== 响应式状态 =====
  const status = ref<ListeningStatus>('idle');
  const transcript = ref('');
  const interimText = ref('');
  const errorMessage = ref('');

  // ===== 非响应式变量 =====
  let recognition: any = null;

  /**
   * 创建并配置 SpeechRecognition 实例
   */
  function createRecognition(): any {
    if (!SpeechRecognitionConstructor) return null;

    const recog = new SpeechRecognitionConstructor();
    // 连续识别模式：设为 false 表示单次识别，用户停止说话后自动结束
    recog.continuous = false;
    // 返回中间结果，实现实时展示效果
    recog.interimResults = interimResults;
    // 设置识别语言
    recog.lang = lang;

    // ===== 事件绑定 =====

    /** 识别结果事件：实时返回识别的文本 */
    recog.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          // 最终结果：整句识别完成
          final += result[0].transcript;
        } else {
          // 中间结果：用户正在说话，实时更新
          interim += result[0].transcript;
        }
      }

      if (final) {
        transcript.value += final;
        status.value = 'recognizing';
      }
      if (interim) {
        interimText.value = interim;
      }
    };

    /** 识别结束事件 */
    recog.onend = () => {
      // 如果已经有识别结果，触发成功回调
      if (transcript.value) {
        status.value = 'idle';
        onResult?.(transcript.value);
      } else if (status.value !== 'error') {
        // 没有结果且不是错误导致的结束
        status.value = 'idle';
      }
      interimText.value = '';
    };

    /** 错误处理事件 */
    recog.onerror = (event: any) => {
      const msg = getErrorMessage(event.error);
      errorMessage.value = msg;
      status.value = 'error';
      onError?.(msg);
    };

    return recog;
  }

  /**
   * 将浏览器错误码转换为用户可读的中文提示
   */
  function getErrorMessage(error: string): string {
    const map: Record<string, string> = {
      'no-speech': '未检测到语音，请重试',
      'aborted': '录音已中断',
      'audio-capture': '无法访问麦克风，请检查权限',
      'network': '网络错误，语音识别失败',
      'not-allowed': '麦克风权限被拒绝，请在浏览器设置中允许',
      'service-not-allowed': '语音识别服务不可用',
      'bad-grammar': '语法错误',
      'language-not-supported': `不支持的语言: ${lang}`,
    };
    return map[error] || `语音识别错误: ${error}`;
  }

  /**
   * 开始录音
   */
  function start() {
    if (!isSupported) {
      errorMessage.value = '当前浏览器不支持语音识别，请使用 Chrome/Edge';
      status.value = 'error';
      return;
    }

    // 如果已经在录音中，先停止
    if (recognition) {
      try { recognition.stop(); } catch { /* ignore */ }
    }

    // 重置状态
    transcript.value = '';
    interimText.value = '';
    errorMessage.value = '';
    status.value = 'listening';

    // 创建新实例并启动
    recognition = createRecognition();
    if (recognition) {
      recognition.start();
    }
  }

  /**
   * 停止录音
   */
  function stop() {
    if (recognition) {
      try {
        recognition.stop();
      } catch { /* ignore */ }
    }
  }

  /**
   * 切换录音/停止状态
   */
  function toggle() {
    if (status.value === 'listening') {
      stop();
    } else {
      start();
    }
  }

  /**
   * 组件卸载时自动停止录音，防止内存泄漏
   */
  onUnmounted(() => {
    if (recognition) {
      try { recognition.stop(); } catch { /* ignore */ }
      recognition = null;
    }
  });

  return {
    isSupported,
    status,
    transcript,
    interimText,
    errorMessage,
    start,
    stop,
    toggle,
  };
}
