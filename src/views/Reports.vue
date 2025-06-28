<template>
  <div class="reports-page">
    <div class="page-header">
      <h2>考勤报告</h2>
      <p class="subtitle">查看历史考勤记录和统计数据</p>
    </div>

    <div class="reports-content">
      <!-- 统计卡片 -->
      <div class="stats-cards" v-if="attendanceStore.attendanceRecords.length > 0">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <div class="stat-value">{{ totalRecords }}</div>
            <div class="stat-label">总记录数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ averageAttendanceRate }}%</div>
            <div class="stat-label">平均出勤率</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <div class="stat-value">{{ latestRecord?.date ? formatDate(latestRecord.date) : '-' }}</div>
            <div class="stat-label">最近点名</div>
          </div>
        </div>
      </div>

      <!-- 考勤记录列表 -->
      <div class="records-section">
        <div class="section-header">
          <h3>考勤记录</h3>
          <!-- 移除班级选择器，只保留空的filters div用于样式 -->
          <div class="filters">
          </div>
        </div>

        <div v-if="filteredRecords.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>暂无考勤记录</p>
          <p class="empty-tip">完成点名后，记录将显示在这里</p>
        </div>

        <div v-else class="records-list">
          <div 
            v-for="record in filteredRecords" 
            :key="record.id" 
            class="record-card"
            @click="showRecordDetail(record)"
          >
            <div class="record-header">
              <div class="record-info">
                <h4>{{ getClassName(record.classId) }}</h4>
                <p class="record-date">{{ formatDateTime(record.date) }}</p>
                <span class="record-type">{{ record.type }}</span>
              </div>
              <div class="record-stats">
                <div class="attendance-rate" :class="getRateClass(record.summary.rate)">
                  {{ record.summary.rate }}%
                </div>
              </div>
            </div>
            <div class="record-summary">
              <div class="summary-item">
                <span class="label">总人数:</span>
                <span class="value">{{ record.summary.total }}</span>
              </div>
              <div class="summary-item present">
                <span class="label">已到:</span>
                <span class="value">{{ record.summary.present }}</span>
              </div>
              <div class="summary-item absent">
                <span class="label">未到:</span>
                <span class="value">{{ record.summary.absent }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog 
      v-model="showDetailDialog" 
      :title="`考勤详情 - ${selectedRecord?.date ? formatDateTime(selectedRecord.date) : ''}`"
      width="600px"
    >
      <div v-if="selectedRecord" class="record-detail">
        <div class="detail-header">
          <div class="detail-info">
            <p><strong>班级:</strong> {{ getClassName(selectedRecord.classId) }}</p>
            <p><strong>日期:</strong> {{ formatDateTime(selectedRecord.date) }}</p>
            <p><strong>类型:</strong> {{ selectedRecord.type }}</p>
            <p><strong>出勤率:</strong> 
              <span :class="getRateClass(selectedRecord.summary.rate)">{{ selectedRecord.summary.rate }}%</span>
            </p>
          </div>
        </div>
        
        <div class="detail-students">
          <h4>学生出勤详情</h4>
          <div class="students-list">
            <div 
              v-for="detail in selectedRecord.details" 
              :key="detail.studentId" 
              class="student-item"
              :class="detail.status === '已到' ? 'present' : 'absent'"
            >
              <div class="student-info">
                <span class="student-name">{{ getStudentName(detail.studentId) }}</span>
                <span class="student-no">{{ getStudentNo(detail.studentId) }}</span>
              </div>
              <div class="attendance-info">
                <span class="status">{{ detail.status }}</span>
                <span class="time">{{ formatTime(detail.time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button type="primary" @click="exportRecord">
          <el-icon><Download /></el-icon>
          导出Excel
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useClassStore } from '@/stores/class'
import { useStudentStore } from '@/stores/student'
import type { AttendanceRecord } from '@/types/attendance'
import { ElMessage } from 'element-plus'
import { exportAttendanceReport } from '@/utils/excel'

const attendanceStore = useAttendanceStore()
const classStore = useClassStore()
const studentStore = useStudentStore()

// 移除本地的selectedClassId状态
const showDetailDialog = ref(false)
const selectedRecord = ref<AttendanceRecord | null>(null)

// 计算属性
// 修改totalRecords，只统计当前班级的记录
const totalRecords = computed(() => {
  if (!classStore.currentClassId) return 0
  return attendanceStore.attendanceRecords.filter(
    (record: any) => record.classId === classStore.currentClassId
  ).length
})

// 修改averageAttendanceRate，只计算当前班级的平均出勤率
const averageAttendanceRate = computed(() => {
  if (!classStore.currentClassId) return 0
  const records = attendanceStore.attendanceRecords.filter(
    (record: any) => record.classId === classStore.currentClassId
  )
  if (records.length === 0) return 0
  const totalRate = records.reduce((sum: any, record: any) => sum + record.summary.rate, 0)
  return Math.round(totalRate / records.length)
})

// 修改latestRecord，只获取当前班级的最近点名记录
const latestRecord = computed(() => {
  if (!classStore.currentClassId) return null
  const records = attendanceStore.attendanceRecords.filter(
    (record: any) => record.classId === classStore.currentClassId
  )
  if (records.length === 0) return null
  return records.reduce((latest: any, record: any) => 
    new Date(record.date) > new Date(latest.date) ? record : latest
  )
})

// 修改filteredRecords，使用全局的currentClassId
const filteredRecords = computed(() => {
  let records = [...attendanceStore.attendanceRecords]
  
  // 使用全局的当前班级ID进行筛选
  if (classStore.currentClassId) {
    records = records.filter(record => record.classId === classStore.currentClassId)
  }
  
  // 按日期倒序排列
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

// 移除filterRecords函数，因为不再需要
function filterRecords() {
  // 筛选逻辑已在计算属性中处理
}

function showRecordDetail(record: AttendanceRecord) {
  selectedRecord.value = record
  showDetailDialog.value = true
}

function getClassName(classId: string): string {
  const cls = classStore.classes.find(c => c.id === classId)
  return cls?.name || '未知班级'
}

function getStudentName(studentId: string): string {
  const student = studentStore.students.find(s => s.id === studentId)
  return student?.name || '未知学生'
}

function getStudentNo(studentId: string): string {
  const student = studentStore.students.find(s => s.id === studentId)
  return student?.studentNo || ''
}

function formatDate(date: Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}年${month}月${day}日 ${hours}:${minutes}`
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('zh-CN')
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('zh-CN')
}

function getRateClass(rate: number): string {
  if (rate >= 90) return 'excellent'
  if (rate >= 80) return 'good'
  if (rate >= 70) return 'normal'
  return 'poor'
}

function exportRecord() {
  if (!selectedRecord.value) return
  
  try {
    const className = getClassName(selectedRecord.value.classId)
    exportAttendanceReport(
      selectedRecord.value,
      className,
      getStudentName,
      getStudentNo
    )
    ElMessage.success('考勤报告导出成功！')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  }
}

// 删除以下函数
// function exportAllRecords() {
//   if (filteredRecords.value.length === 0) {
//     ElMessage.warning('暂无考勤记录可导出')
//     return
//   }
//   
//   try {
//     exportAttendanceReports(
//       filteredRecords.value,
//       getClassName,
//       getStudentName,
//       getStudentNo
//     )
//     ElMessage.success('考勤报告汇总导出成功！')
//   } catch (error) {
//     console.error('导出失败:', error)
//     ElMessage.error('导出失败，请重试')
//   }
// }
</script>

<style scoped>
.reports-page {
  padding: 20px;
  background: linear-gradient(135deg, #55efc4 0%, #81ecec 25%, #74b9ff 50%, #a29bfe 75%, #fd79a8 100%);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.page-header h2 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.reports-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #a29bfe 100%);
  border-radius: 15px;
  padding: 25px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
  color: white;
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #e17055 100%);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #55efc4 0%, #81ecec 50%, #74b9ff 100%);
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 20px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.stat-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

/* 记录列表 */
.records-section {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 50%, #fd79a8 100%);
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  color: white;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.9);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-tip {
  font-size: 0.9rem;
  opacity: 0.7;
}

.records-list {
  display: grid;
  gap: 15px;
}

.record-card {
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.record-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.record-info h4 {
  margin: 0 0 5px 0;
  color: white;
}

.record-date {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin: 0 0 5px 0;
}

.record-type {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.attendance-rate {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 20px;
  color: white;
}

.attendance-rate.excellent {
  background: #4caf50;
}

.attendance-rate.good {
  background: #ff9800;
}

.attendance-rate.normal {
  background: #ff5722;
}

.attendance-rate.poor {
  background: #f44336;
}

.record-summary {
  display: flex;
  gap: 20px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.summary-item .label {
  color: #666;
  font-size: 0.9rem;
}

.summary-item .value {
  font-weight: bold;
}

.summary-item.present .value {
  color: #4caf50;
}

.summary-item.absent .value {
  color: #f44336;
}

/* 详情弹窗 */
.record-detail {
  max-height: 500px;
  overflow-y: auto;
}

.detail-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.detail-info p {
  margin: 8px 0;
}

.students-list {
  max-height: 300px;
  overflow-y: auto;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.student-item.present {
  background: #e8f5e8;
  border-left: 4px solid #4caf50;
}

.student-item.absent {
  background: #ffeaea;
  border-left: 4px solid #f44336;
}

.student-info {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: bold;
  margin-bottom: 2px;
}

.student-no {
  font-size: 0.8rem;
  color: #666;
}

.attendance-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.status {
  font-weight: bold;
  margin-bottom: 2px;
}

.student-item.present .status {
  color: #4caf50;
}

.student-item.absent .status {
  color: #f44336;
}

.time {
  font-size: 0.8rem;
  color: #666;
}
</style>