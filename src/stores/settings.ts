import { ref } from 'vue'
import { defineStore } from 'pinia'
import { audioManager } from '@/utils/audio'
import { animationManager } from '@/utils/animation'

export const useSettingsStore = defineStore('settings', () => {
  const audioEnabled = ref(true)
  const animationEnabled = ref(true)
  
  function setAudioEnabled(enabled: boolean) {
    audioEnabled.value = enabled
    audioManager.setEnabled(enabled)
  }
  
  function setAnimationEnabled(enabled: boolean) {
    animationEnabled.value = enabled
    animationManager.setEnabled(enabled)
  }
  
  return {
    audioEnabled,
    animationEnabled,
    setAudioEnabled,
    setAnimationEnabled
  }
})