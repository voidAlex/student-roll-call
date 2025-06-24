<template>
  <div class="roll-call-container">
    <!-- 点名未开始状态 -->
    <div v-if="!attendanceStore.currentRollCallSession" class="start-container">
      <div class="start-card">
        <h2 class="title">全员点名</h2>
        <div class="class-info">
          <p class="class-name">{{ classStore.currentClass?.name }}</p>
          <p class="student-count">共 {{ studentStore.currentClassStudents.length }} 名学生</p>
        </div>
        <button 
          @click="startRollCall" 
          :disabled="studentStore.currentClassStudents.length === 0"
          class="start-btn"
        >
          开始点名
        </button>
      </div>
    </div>
    
    <!-- 点名进行中状态 -->
    <div v-else class="roll-call-active">
      <!-- 进度条 -->
      <div class="progress-container">
        <div class="progress-info">
          <span>{{ attendanceStore.rollCallProgress.current }} / {{ attendanceStore.rollCallProgress.total }}</span>
          <span>{{ attendanceStore.rollCallProgress.percentage }}%</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: attendanceStore.rollCallProgress.percentage + '%' }"
          ></div>
        </div>
      </div>
      
      <!-- 学生卡片 -->
      <div class="student-card-container">
        <transition name="card-flip" mode="out-in">
          <div 
            v-if="attendanceStore.currentStudent" 
            :key="attendanceStore.currentStudent.studentId"
            class="student-card"
          >
            <div class="student-avatar">
              <div class="avatar-circle">
                {{ attendanceStore.currentStudent.avatar || '👤' }}
              </div>
            </div>
            <div class="student-info">
              <h3 class="student-name">{{ attendanceStore.currentStudent.name }}</h3>
              <p class="student-no">学号：{{ attendanceStore.currentStudent.studentNo }}</p>
            </div>
          </div>
        </transition>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button 
          @click="markPresent" 
          class="present-btn"
          :disabled="!attendanceStore.currentStudent"
        >
          <span class="btn-icon">✓</span>
          已到
        </button>
        <button 
          @click="markAbsent" 
          class="absent-btn"
          :disabled="!attendanceStore.currentStudent"
        >
          <span class="btn-icon">✗</span>
          未到
        </button>
      </div>
      
      <!-- 退出按钮 -->
      <button @click="exitRollCall" class="exit-btn">
        退出点名
      </button>
    </div>
    
    <!-- 点名完成状态 -->
    <div v-if="attendanceStore.currentRollCallSession?.isCompleted" class="completion-overlay">
      <div class="completion-card">
        <div class="completion-icon">🎉</div>
        <h3>点名完成！</h3>
        <div class="completion-summary">
          <p>应到：{{ attendanceStore.rollCallProgress.total }} 人</p>
          <p>实到：{{ getPresentCount() }} 人</p>
          <p>缺勤：{{ getAbsentCount() }} 人</p>
          <p>出勤率：{{ getAttendanceRate() }}%</p>
        </div>
        <button @click="finishRollCall" class="finish-btn">
          完成
        </button>
      </div>
    </div>
    
    <!-- 动画效果容器 -->
    <div class="animation-container">
      <transition name="flower-animation">
        <div v-if="showFlowerAnimation" class="flower-effect">🌸</div>
      </transition>
      <transition name="bomb-animation">
        <div v-if="showBombAnimation" class="bomb-effect">💥</div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAttendanceStore } from '@/stores/attendance'
import { useClassStore } from '@/stores/class'
import { useStudentStore } from '@/stores/student'
import { ElMessage } from 'element-plus'

const router = useRouter()
const attendanceStore = useAttendanceStore()
const studentStore = useStudentStore()
const classStore = useClassStore()

const showFlowerAnimation = ref(false)
const showBombAnimation = ref(false)

// 开始点名
function startRollCall() {
  try {
    if (!classStore.currentClassId) {
      ElMessage.error('请先选择班级')
      return
    }
    attendanceStore.startRollCall(classStore.currentClassId)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '开始点名失败')
  }
}

// 标记已到
function markPresent() {
  if (!attendanceStore.currentStudent) return
  
  attendanceStore.markAttendance(attendanceStore.currentStudent.studentId, '已到')
  
  // 显示小红花动画
  showFlowerAnimation.value = true
  setTimeout(() => {
    showFlowerAnimation.value = false
  }, 1000)
}

// 标记未到
function markAbsent() {
  if (!attendanceStore.currentStudent) return
  
  attendanceStore.markAttendance(attendanceStore.currentStudent.studentId, '未到')
  
  // 显示炸弹动画
  showBombAnimation.value = true
  setTimeout(() => {
    showBombAnimation.value = false
  }, 1000)
}

// 退出点名
function exitRollCall() {
  attendanceStore.endRollCall()
}

// 完成点名
function finishRollCall() {
  attendanceStore.endRollCall()
  ElMessage.success('点名记录已保存')
  router.push('/reports')
}

// 获取出勤人数
function getPresentCount() {
  if (!attendanceStore.currentRollCallSession) return 0
  return attendanceStore.currentRollCallSession.students.filter(s => s.status === '已到').length
}

// 获取缺勤人数
function getAbsentCount() {
  if (!attendanceStore.currentRollCallSession) return 0
  return attendanceStore.currentRollCallSession.students.filter(s => s.status === '未到').length
}

// 获取出勤率
function getAttendanceRate() {
  if (!attendanceStore.currentRollCallSession) return 0
  const total = attendanceStore.currentRollCallSession.students.length
  const present = getPresentCount()
  return total > 0 ? Math.round((present / total) * 100) : 0
}
</script>

<style scoped>
.roll-call-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 开始点名样式 */
.start-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.start-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
  font-weight: bold;
}

.class-info {
  margin: 30px 0;
}

.class-name {
  font-size: 1.5rem;
  color: #667eea;
  font-weight: bold;
  margin-bottom: 10px;
}

.student-count {
  color: #666;
  font-size: 1.1rem;
}

.start-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 点名进行中样式 */
.roll-call-active {
  max-width: 800px;
  margin: 0 auto;
}

.progress-container {
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-weight: bold;
  color: #333;
}

.progress-bar {
  height: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  transition: width 0.5s ease;
}

.student-card-container {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  perspective: 1000px;
}

.student-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 400px;
  transform-style: preserve-3d;
}

.student-avatar {
  margin-bottom: 20px;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto;
  color: white;
}

.student-name {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}

.student-no {
  color: #666;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 30px;
}

.present-btn, .absent-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.present-btn {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
}

.absent-btn {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  color: white;
}

.present-btn:hover:not(:disabled),
.absent-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.btn-icon {
  font-size: 1.5rem;
}

.exit-btn {
  display: block;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.exit-btn:hover {
  background: white;
  color: #667eea;
}

/* 完成状态样式 */
.completion-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.completion-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.completion-summary {
  margin: 20px 0;
  text-align: left;
}

.completion-summary p {
  margin: 10px 0;
  font-size: 1.1rem;
}

.finish-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.finish-btn:hover {
  transform: translateY(-2px);
}

/* 动画效果 */
.animation-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 999;
}

.flower-effect, .bomb-effect {
  font-size: 5rem;
  animation-duration: 1s;
  animation-fill-mode: both;
}

.flower-animation-enter-active {
  animation: flowerBounce 1s ease-out;
}

.bomb-animation-enter-active {
  animation: bombExplode 1s ease-out;
}

@keyframes flowerBounce {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 0;
  }
}

@keyframes bombExplode {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  30% {
    transform: scale(1.5);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* 卡片翻转动画 */
.card-flip-enter-active,
.card-flip-leave-active {
  transition: all 0.6s ease;
}

.card-flip-enter-from {
  transform: rotateY(-90deg);
  opacity: 0;
}

.card-flip-leave-to {
  transform: rotateY(90deg);
  opacity: 0;
}
</style>