<template>
  <div class="random-call-container">
    <!-- 背景动画 -->
    <div class="animated-background"></div>

    <!-- 设置面板 -->
    <div v-if="!attendanceStore.currentRandomCallSession" class="settings-panel">
      <div class="panel-card">
        <h2 class="title">🎲 随机点名</h2>

        <div class="class-info">
          <p class="class-name">{{ classStore.currentClass?.name }}</p>
          <p class="student-count">共 {{ studentStore.currentClassStudents.length }} 名学生</p>
        </div>

        <div class="settings-form">
          <div class="form-group">
            <div class="setting-item">
              <label>抽取人数：</label>
              <div class="count-control">
                <button @click="decreasePickCount" :disabled="settings.pickCount <= 1" class="count-btn">-</button>
                <span class="count-display">{{ settings.pickCount }}</span>
                <button @click="increasePickCount" :disabled="settings.pickCount >= maxPickCount" class="count-btn">+</button>
              </div>
            </div>
          </div>
        </div>

        <button
          @click="startRandomCall"
          :disabled="studentStore.currentClassStudents.length === 0"
          class="start-btn"
        >
          开始随机点名
        </button>
      </div>
    </div>

    <!-- 随机点名进行中 -->
    <div v-else class="random-call-active">
      <!-- 控制面板 -->
      <div class="control-panel">
        <div class="session-info">
          <h3>{{ classStore.currentClass?.name }} - 随机点名</h3>
          <p>抽取人数：{{ settings.pickCount }} 人</p>
        </div>

        <div class="control-buttons">
          <button
            @click="performPick"
            :disabled="isSpinning || availableStudentsCount === 0"
            class="pick-btn"
          >
            {{ isSpinning ? '抽取中...' : '开始抽取' }}
          </button>

          <button @click="resetSession" class="reset-btn">
            重置
          </button>

          <button @click="endSession" class="end-btn">
            结束
          </button>
        </div>
      </div>

      <!-- 随机选择器 -->
      <RandomPicker
        :students="availableStudents"
        :pick-count="settings.pickCount"
        :is-spinning="isSpinning"
        :selected-students="currentSelectedStudents"
        :selected-index="selectedStudentIndex"
      />

      <!-- 统计信息 -->
      <div class="statistics">
        <div class="stat-item">
          <span class="stat-label">总学生数</span>
          <span class="stat-value">{{ studentStore.currentClassStudents.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">可选学生</span>
          <span class="stat-value">{{ availableStudentsCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已抽取次数</span>
          <span class="stat-value">{{ attendanceStore.currentRandomCallSession.history.length }}</span>
        </div>
      </div>

      <!-- 历史记录 -->
      <div v-if="attendanceStore.currentRandomCallSession.history.length > 0" class="history-panel">
        <h4>抽取历史</h4>
        <div class="history-list">
          <div
            v-for="(record, index) in attendanceStore.currentRandomCallSession.history.slice().reverse()"
            :key="record.id"
            class="history-item"
          >
            <div class="history-header">
              <span class="history-index">第 {{ attendanceStore.currentRandomCallSession.history.length - index }} 次</span>
              <span class="history-time">{{ formatTime(record.time) }}</span>
            </div>
            <div class="history-students">
              <span
                v-for="student in record.selectedStudents"
                :key="student.studentId"
                class="history-student"
              >
                {{ student.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAttendanceStore } from '@/stores/attendance'
import { useStudentStore } from '@/stores/student'
import { useClassStore } from '@/stores/class'
import RandomPicker from '@/components/rollcall/RandomPicker.vue'
import type { RandomCallSettings } from '@/types/attendance'

const router = useRouter()
const attendanceStore = useAttendanceStore()
const studentStore = useStudentStore()
const classStore = useClassStore()

const isSpinning = ref(false)
const currentSelectedStudents = ref([])
const selectedStudentIndex = ref(-1) // 新增：选中学生的索引

// 设置
const settings = ref<RandomCallSettings>({
  pickCount: 1,
  excludeSelected: false,
  enableSound: true
})

// 最大抽取人数（限制为5）
const maxPickCount = computed(() => {
  return Math.min(5, Math.max(1, studentStore.currentClassStudents.length))
})

// 可用学生列表
const availableStudents = computed(() => {
  if (!attendanceStore.currentRandomCallSession) {
    return studentStore.currentClassStudents.map(student => ({
      studentId: student.id,
      name: student.name,
      studentNo: student.studentNo,
      avatar: student.avatar
    }))
  }

  const session = attendanceStore.currentRandomCallSession
  const allStudents = studentStore.currentClassStudents.map(student => ({
    studentId: student.id,
    name: student.name,
    studentNo: student.studentNo,
    avatar: student.avatar
  }))

  if (session.excludeSelected) {
    const selectedIds = session.selectedStudents.map(s => s.studentId)
    return allStudents.filter(s => !selectedIds.includes(s.studentId))
  }

  return allStudents
})

// 可用学生数量
const availableStudentsCount = computed(() => availableStudents.value.length)

// 增加抽取人数
function increasePickCount() {
  if (settings.value.pickCount < maxPickCount.value) {
    settings.value.pickCount++
  }
}

// 减少抽取人数
function decreasePickCount() {
  if (settings.value.pickCount > 1) {
    settings.value.pickCount--
  }
}

// 开始随机点名
function startRandomCall() {
  if (!classStore.currentClassId) {
    alert('请先选择班级')
    return
  }

  if (studentStore.currentClassStudents.length === 0) {
    alert('当前班级没有学生')
    return
  }

  // 更新设置
  attendanceStore.updateRandomCallSettings(settings.value)

  // 开始会话
  attendanceStore.startRandomCall(classStore.currentClassId)
}

// 执行抽取
function performPick() {
  if (isSpinning.value || availableStudentsCount.value === 0) return

  // 先选择学生（但不记录历史）
  let selectedStudents
  try {
    selectedStudents = attendanceStore.performRandomPick()
  } catch (error) {
    alert(error.message)
    return
  }

  // 计算第一个选中学生在转盘中的位置
  const selectedStudent = selectedStudents[0]
  const studentIndex = availableStudents.value.findIndex(s => s.studentId === selectedStudent.studentId)
  
  if (studentIndex === -1) {
    alert('选中的学生不在当前列表中')
    return
  }

  // 开始旋转动画
  isSpinning.value = true
  currentSelectedStudents.value = [] // 清空之前的结果
  selectedStudentIndex.value = studentIndex

  // 3秒后显示结果并添加到历史
  setTimeout(() => {
    currentSelectedStudents.value = selectedStudents
    attendanceStore.addToHistory(selectedStudents) // 在这里添加历史记录
    isSpinning.value = false
  }, 3000)
}

// 重置会话
function resetSession() {
  if (confirm('确定要重置当前会话吗？这将清除所有抽取历史。')) {
    attendanceStore.endRandomCall()
    startRandomCall()
  }
}

// 结束会话
function endSession() {
  if (confirm('确定要结束随机点名吗？')) {
    attendanceStore.endRandomCall()
  }
}

// 格式化时间
function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 检查班级
onMounted(() => {
  if (!classStore.currentClassId) {
    alert('请先选择班级')
    router.push('/class-manage')
  }
})

// 清理
onUnmounted(() => {
  // 可以选择是否在离开页面时结束会话
  // attendanceStore.endRandomCall()
})

// 监听班级变化
watch(() => classStore.currentClassId, (newClassId, oldClassId) => {
// 如果班级发生变化且之前有班级（不是初始化）
if (oldClassId && newClassId !== oldClassId) {
// 如果当前有进行中的随机点名会话，结束它
if (attendanceStore.currentRandomCallSession) {
attendanceStore.endRandomCall()
}
// 重置组件状态
isSpinning.value = false
currentSelectedStudents.value = []
selectedStudentIndex.value = -1
// 重置设置
settings.value = {
pickCount: 1,
excludeSelected: false,
enableSound: true
}
}
})
</script>

<style scoped>
/* 基础布局 */
.random-call-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: backgroundShift 20s ease-in-out infinite;
}

@keyframes backgroundShift {
  0%, 100% { transform: translateX(0) translateY(0); }
  25% { transform: translateX(-20px) translateY(-10px); }
  50% { transform: translateX(20px) translateY(10px); }
  75% { transform: translateX(-10px) translateY(20px); }
}

/* 设置面板 */
.settings-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  position: relative;
  z-index: 1;
}

.panel-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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

/* 表单样式 */
.settings-form {
  margin-bottom: 30px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.setting-item label {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.count-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.count-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.count-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.count-btn:disabled {
  border-color: #d1d5db;
  color: #d1d5db;
  cursor: not-allowed;
}

.count-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  min-width: 2rem;
  text-align: center;
}

/* 按钮样式 */
.start-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}

.start-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
}

/* 活动状态样式 */
.random-call-active {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.control-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.session-info h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
}

.session-info p {
  margin: 0;
  color: #666;
  font-size: 1.1rem;
}

.control-buttons {
  display: flex;
  gap: 15px;
}

.pick-btn, .reset-btn, .end-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.pick-btn {
  background: linear-gradient(45deg, #10b981, #059669);
  color: white;
}

.reset-btn {
  background: linear-gradient(45deg, #f59e0b, #d97706);
  color: white;
}

.end-btn {
  background: linear-gradient(45deg, #ef4444, #dc2626);
  color: white;
}

.pick-btn:hover:not(:disabled),
.reset-btn:hover,
.end-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.pick-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* 统计信息 */
.statistics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  width: 100%;
}

.stat-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.stat-value {
  display: block;
  color: #333;
  font-size: 2rem;
  font-weight: bold;
}

/* 历史记录 */
.history-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  width: 100%;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.history-panel h4 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: center;
  font-size: 1.3rem;
  font-weight: bold;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  display: grid;
  gap: 15px;
}

.history-item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 15px;
  border-left: 4px solid #667eea;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-index {
  font-weight: bold;
  color: #333;
}

.history-time {
  color: #666;
  font-size: 0.9rem;
}

.history-students {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.history-student {
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
}
</style>
