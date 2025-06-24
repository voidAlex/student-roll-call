// 音效管理工具
export class AudioManager {
  private audioContext: AudioContext | null = null
  private audioCache: Map<string, AudioBuffer> = new Map()
  private isEnabled: boolean = true

  constructor() {
    // 初始化音频上下文
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext()
    }
  }

  // 预加载音效文件
  async preloadAudio(name: string, url: string): Promise<void> {
    if (!this.audioContext) return

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.audioCache.set(name, audioBuffer)
    } catch (error) {
      console.warn(`Failed to load audio: ${name}`, error)
    }
  }

  // 播放音效
  playSound(name: string, volume: number = 0.5): void {
    if (!this.isEnabled || !this.audioContext) return

    const audioBuffer = this.audioCache.get(name)
    if (!audioBuffer) {
      console.warn(`Audio not found: ${name}`)
      return
    }

    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = audioBuffer
      gainNode.gain.value = volume
      
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      source.start()
    } catch (error) {
      console.warn(`Failed to play audio: ${name}`, error)
    }
  }

  // 设置音效开关
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  // 获取音效状态
  getEnabled(): boolean {
    return this.isEnabled
  }
}

// 创建全局音效管理器实例
export const audioManager = new AudioManager()

// 预设音效名称
export const AUDIO_NAMES = {
  PRESENT: 'present', // 已到音效
  ABSENT: 'absent',   // 未到音效
  COMPLETE: 'complete', // 完成音效
  FLIP: 'flip'        // 翻页音效
} as const

// 初始化音效资源
export async function initAudioResources(): Promise<void> {
  const audioFiles = [
    { name: AUDIO_NAMES.PRESENT, url: '/sounds/present.mp3' },
    { name: AUDIO_NAMES.ABSENT, url: '/sounds/absent.mp3' },
    { name: AUDIO_NAMES.COMPLETE, url: '/sounds/complete.mp3' },
    { name: AUDIO_NAMES.FLIP, url: '/sounds/flip.mp3' }
  ]

  await Promise.all(
    audioFiles.map(({ name, url }) => audioManager.preloadAudio(name, url))
  )
}