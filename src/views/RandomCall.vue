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
          <span class="stat-label">总学生数：</span>
          <span class="stat-value">{{ studentStore.currentClassStudents.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">可选学生：</span>
          <span class="stat-value">{{ availableStudentsCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已抽取次数：</span>
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
.setting-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.setting-item label {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.count-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.random-call-container {
  min-height: 100vh;
  position: relative;
  padding: 2rem;
  overflow: hidden;
}

/* 动画背景 */
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  z-index: -1;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 设置面板 */
.settings-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.panel-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 3rem;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  backdrop-filter: blur(10px);
  max-width: 500px;
  width: 100%;
}

.title {
  font-size: 3rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.class-info {
  margin-bottom: 2rem;
}

.class-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.student-count {
  color: #666;
  font-size: 1.1rem;
}

/* 表单样式 */
.settings-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.5rem;
}

.number-input {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.count-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.count-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: scale(1.1);
}

.count-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.count-display {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  min-width: 3rem;
  text-align: center;
}

/* 复选框样式 */
.checkbox-label {
  display: flex !important;
  align-items: center;
  cursor: pointer;
  font-weight: normal !important;
}

.checkbox {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #3b82f6;
  border-radius: 4px;
  margin-right: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox:checked + .checkmark {
  background: #3b82f6;
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
}

/* 单选框样式 */
.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-label {
  display: flex !important;
  align-items: center;
  cursor: pointer;
  font-weight: normal !important;
}

.radio {
  display: none;
}

.radio-mark {
  width: 20px;
  height: 20px;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  margin-right: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.radio:checked + .radio-mark {
  background: #3b82f6;
}

.radio:checked + .radio-mark::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

/* 按钮样式 */
.start-btn {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(59, 130, 246, 0.4);
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
  gap: 2rem;
  align-items: center;
}

.control-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 800px;
  backdrop-filter: blur(10px);
}

.session-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.session-info p {
  margin: 0;
  color: #666;
}

.control-buttons {
  display: flex;
  gap: 1rem;
}

.pick-btn, .reset-btn, .end-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pick-btn {
  background: linear-gradient(45deg, #10b981, #34d399);
  color: white;
}

.reset-btn {
  background: linear-gradient(45deg, #f59e0b, #fbbf24);
  color: white;
}

.end-btn {
  background: linear-gradient(45deg, #ef4444, #f87171);
  color: white;
}

.pick-btn:hover:not(:disabled),
.reset-btn:hover,
.end-btn:hover {
  transform: translateY(-2px);
}

.pick-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* 统计信息 */
.statistics {
  display: flex;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  color: #333;
  font-size: 1.5rem;
  font-weight: bold;
}

/* 历史记录 */
.history-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 1.5rem;
  width: 100%;
  max-width: 800px;
  backdrop-filter: blur(10px);
}

.history-panel h4 {
  margin: 0 0 1rem 0;
  color: #333;
  text-align: center;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
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
  gap: 0.5rem;
  flex-wrap: wrap;
}

.history-student {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.9rem;
}
</style>
