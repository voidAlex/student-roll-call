<template>
  <div class="random-picker">
    <!-- 转盘容器 -->
    <div class="roulette-container">
      <div class="roulette-wheel" :class="{ spinning: isSpinning }" :style="{ transform: `rotate(${rotation}deg)` }">
        <div 
          v-for="(student, index) in students" 
          :key="student.studentId"
          class="roulette-segment"
          :style="getSegmentStyle(index)"
        >
          <div class="student-info">
            <div class="avatar">{{ student.avatar || '👤' }}</div>
            <div class="name">{{ student.name }}</div>
          </div>
        </div>
      </div>
      <!-- 删除这行：<div class="roulette-pointer"></div> -->
    </div>
    
    <!-- 结果显示 -->
    <div v-if="selectedStudents.length > 0 && !isSpinning" class="result-display">
      <div class="result-title">🎉 抽中的同学 🎉</div>
      <div class="selected-students">
        <div 
          v-for="student in selectedStudents" 
          :key="student.studentId"
          class="selected-student"
        >
          <div class="student-avatar glowing">{{ student.avatar || '👤' }}</div>
          <div class="student-name">{{ student.name }}</div>
          <div class="student-no">{{ student.studentNo }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import type { RollCallStudent } from '@/types/attendance'
import { audioManager } from '@/utils/audio'
import { animationManager } from '@/utils/animation'

interface Props {
  students: RollCallStudent[]
  pickCount: number
  isSpinning: boolean
  selectedStudents: RollCallStudent[]
}

const props = defineProps<Props>()

const rotation = ref(0)

// 获取转盘分段样式
function getSegmentStyle(index: number) {
  const segmentAngle = 360 / props.students.length
  const rotation = segmentAngle * index
  return {
    transform: `rotate(${rotation}deg)`,
    '--segment-color': getSegmentColor(index)
  }
}

// 获取分段颜色
function getSegmentColor(index: number) {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ]
  return colors[index % colors.length]
}

// 开始转盘动画 - 简化为纯视觉效果
function startRouletteAnimation() {
  const spins = 5 + Math.random() * 3 // 5-8圈
  const finalAngle = Math.random() * 360 // 随机停止角度
  rotation.value += spins * 360 + finalAngle
}

// 监听旋转状态变化
watch(() => props.isSpinning, (isSpinning) => {
  if (isSpinning) {
    startRouletteAnimation()

    // 播放旋转音效
    audioManager.playSound('spin', 0.3)
  } else if (props.selectedStudents.length > 0) {
    // 播放成功音效
    audioManager.playSound('success', 0.5)

    // 创建粒子效果
    nextTick(() => {
      const resultElement = document.querySelector('.result-display')
      if (resultElement) {
        animationManager.createParticleEffect(resultElement as HTMLElement, 'success')
      }
    })
  }
})

onMounted(() => {
  // 预加载音效
  audioManager.preloadAudio('spin', '/sounds/spin.mp3')
  audioManager.preloadAudio('success', '/sounds/success.mp3')
})
</script>

<style scoped>
.random-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* 转盘样式 */
.roulette-container {
  position: relative;
  width: 400px;
  height: 400px;
}

.roulette-wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  transition: transform 3s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.roulette-wheel.spinning {
  transition: transform 3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.roulette-segment {
  position: absolute;
  width: 50%;
  height: 50%;
  top: 50%;
  left: 50%;
  transform-origin: 0 0;
  background: var(--segment-color);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  font-size: 0.8rem;
  text-align: center;
  width: 80%;
  height: 80%;
  transform: rotate(90deg); /* 让文字保持正向 */
  margin-left: 25%; /* 向外移动到扇形中心 */
}

.student-info .avatar {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
}

.student-info .name {
  font-weight: bold;
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50px;
}

/* 删除指针样式 */
/*
.roulette-pointer {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 30px solid #333;
  z-index: 10;
}
*/

/* 老虎机样式 */
.slot-machine-container {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 4px solid #ffd700;
  position: relative;
}

.slot-machine-container::before {
  content: '🎰';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  background: white;
  padding: 0.5rem;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.slot-reels {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.slot-reel {
  width: 120px;
  height: 240px;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
  border: 3px solid #ffd700;
}

.slot-reel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.8) 0%,
    transparent 20%,
    transparent 80%,
    rgba(0, 0, 0, 0.3) 100%
  );
  pointer-events: none;
  z-index: 2;
}

.reel-strip {
  transition: none;
  position: relative;
  will-change: transform;
}

/* 减速阶段的动画 */
.slot-reel.spinning .reel-strip {
  transition: transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* 添加滚动时的视觉效果 */
.slot-reel.spinning .reel-item {
  filter: blur(0.5px);
  opacity: 0.9;
}

.slot-reel:not(.spinning) .reel-item {
  filter: none;
  opacity: 1;
  transition: filter 0.3s ease, opacity 0.3s ease;
}

/* 滚轮发光效果 */
.slot-reel.spinning {
  box-shadow:
    inset 0 0 20px rgba(0, 0, 0, 0.2),
    0 0 15px rgba(255, 215, 0, 0.5);
  animation: slotGlow 0.8s ease-in-out infinite alternate;
}

@keyframes slotGlow {
  from {
    box-shadow:
      inset 0 0 20px rgba(0, 0, 0, 0.2),
      0 0 15px rgba(255, 215, 0, 0.5);
  }
  to {
    box-shadow:
      inset 0 0 20px rgba(0, 0, 0, 0.2),
      0 0 25px rgba(255, 215, 0, 0.8);
  }
}

.reel-item {
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid #dee2e6;
  background: white;
  margin: 2px;
  border-radius: 5px;
}

.reel-item .avatar {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.reel-item .name {
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}

/* 结果显示样式 */
.result-display {
  text-align: center;
}

.result-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out;
}

.selected-students {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.selected-student {
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: zoomIn 0.5s ease-out;
}

.student-avatar.glowing {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1rem;
  animation: glow 2s ease-in-out infinite alternate;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.student-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.student-no {
  color: white;
  opacity: 0.9;
  font-size: 1rem;
}

/* 动画效果 */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes glow {
  from {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }
  to {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.9), 0 0 40px rgba(255, 215, 0, 0.6);
  }
}
</style>
