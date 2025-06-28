import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import type { AttendanceRecord, AttendanceDetail, RollCallSession, RollCallStudent, RandomCallSession, RandomCallSettings, RandomCallHistoryRecord } from '@/types/attendance'
import { useStudentStore } from './student'
import { useClassStore } from './class'
import { AntiRepeatRandomPicker } from '@/utils/random'

export const useAttendanceStore = defineStore('attendance', () => {
  // 考勤记录
  const attendanceRecords = ref<AttendanceRecord[]>([])

  // 当前点名会话
  const currentRollCallSession = ref<RollCallSession | null>(null)

  // 随机点名会话
  const currentRandomCallSession = ref<RandomCallSession | null>(null)

  // 随机点名设置
  const randomCallSettings = ref<RandomCallSettings>({
    pickCount: 1,
    excludeSelected: false,
    enableSound: true
  })

  // 防重复随机选择器
  const antiRepeatPicker = new AntiRepeatRandomPicker<RollCallStudent>(3)

  // 开始全员点名
  function startRollCall(classId: string): RollCallSession {
    const studentStore = useStudentStore()
    const students = studentStore.currentClassStudents

    if (students.length === 0) {
      throw new Error('当前班级没有学生，无法开始点名')
    }

    const rollCallStudents: RollCallStudent[] = students.map(student => ({
      studentId: student.id,
      name: student.name,
      studentNo: student.studentNo,
      avatar: student.avatar
    }))

    const session: RollCallSession = {
      id: uuidv4(),
      classId,
      startTime: new Date(),
      currentIndex: 0,
      isCompleted: false,
      students: rollCallStudents
    }

    currentRollCallSession.value = session
    return session
  }

  // 标记学生出勤状态
  function markAttendance(studentId: string, status: '已到' | '未到') {
    if (!currentRollCallSession.value) {
      throw new Error('没有进行中的点名会话')
    }

    const session = currentRollCallSession.value
    const student = session.students.find(s => s.studentId === studentId)

    if (!student) {
      throw new Error('学生不存在')
    }

    student.status = status
    student.time = new Date()

    // 移动到下一个学生
    if (session.currentIndex < session.students.length - 1) {
      session.currentIndex++
    } else {
      // 点名完成
      session.isCompleted = true
      saveRollCallRecord()
    }
  }

  // 保存点名记录
  function saveRollCallRecord() {
    if (!currentRollCallSession.value) return

    const session = currentRollCallSession.value
    const details: AttendanceDetail[] = session.students
      .filter(s => s.status && s.time)
      .map(s => ({
        studentId: s.studentId,
        status: s.status!,
        time: s.time!
      }))

    const presentCount = details.filter(d => d.status === '已到').length
    const absentCount = details.filter(d => d.status === '未到').length
    const total = session.students.length

    const record: AttendanceRecord = {
      id: uuidv4(),
      classId: session.classId,
      date: session.startTime,
      type: '全员点名',
      details,
      summary: {
        total,
        present: presentCount,
        absent: absentCount,
        rate: Math.round((presentCount / total) * 100)
      }
    }

    attendanceRecords.value.push(record)
    // 添加持久化保存
    saveAttendanceToStorage()
  }

  // 删除考勤记录
  function deleteAttendanceRecord(id: string): boolean {
    const index = attendanceRecords.value.findIndex(r => r.id === id)
    if (index === -1) return false

    attendanceRecords.value.splice(index, 1)
    saveAttendanceToStorage()
    return true
  }

  // 获取指定班级的考勤记录
  function getAttendanceByClass(classId: string): AttendanceRecord[] {
    return attendanceRecords.value.filter(record => record.classId === classId)
  }

  // 获取指定日期范围的考勤记录
  function getAttendanceByDateRange(startDate: Date, endDate: Date): AttendanceRecord[] {
    return attendanceRecords.value.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  // 保存考勤数据到本地存储
  function saveAttendanceToStorage(): void {
    try {
      localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords.value))
    } catch (error) {
      console.error('Failed to save attendance records to localStorage:', error)
    }
  }

  // 从本地存储加载考勤数据
  function loadAttendanceFromStorage(): void {
    const storedRecords = localStorage.getItem('attendanceRecords')
    if (storedRecords) {
      try {
        const parsedRecords = JSON.parse(storedRecords)
        // 转换日期字符串为Date对象
        attendanceRecords.value = parsedRecords.map((record: any) => ({
          ...record,
          date: new Date(record.date),
          details: record.details.map((detail: any) => ({
            ...detail,
            time: new Date(detail.time)
          }))
        }))
      } catch (error) {
        console.error('Failed to parse attendance records from localStorage:', error)
        attendanceRecords.value = []
      }
    }
  }

  // 清空所有考勤记录
  function clearAllAttendanceRecords(): void {
    attendanceRecords.value = []
    saveAttendanceToStorage()
  }

  // 获取当前学生
  const currentStudent = computed(() => {
    if (!currentRollCallSession.value) return null
    const session = currentRollCallSession.value
    return session.students[session.currentIndex] || null
  })

  // 获取点名进度
  const rollCallProgress = computed(() => {
    if (!currentRollCallSession.value) return { current: 0, total: 0, percentage: 0 }
    const session = currentRollCallSession.value
    const current = session.currentIndex + 1
    const total = session.students.length
    const percentage = Math.round((current / total) * 100)
    return { current, total, percentage }
  })

  // 结束点名会话
  function endRollCall() {
    if (currentRollCallSession.value && !currentRollCallSession.value.isCompleted) {
      saveRollCallRecord()
    }
    currentRollCallSession.value = null
  }

  // 初始化时加载数据
  loadAttendanceFromStorage()

  // 更新随机点名设置
  function updateRandomCallSettings(settings: Partial<RandomCallSettings>) {
    randomCallSettings.value = { ...randomCallSettings.value, ...settings }
  }

  // 结束随机点名会话
  function endRandomCall() {
    if (currentRandomCallSession.value) {
      currentRandomCallSession.value.isCompleted = true
      currentRandomCallSession.value = null
    }
  }

  // 开始随机点名
  function startRandomCall(classId: string): RandomCallSession {
    const studentStore = useStudentStore()
    const students = studentStore.currentClassStudents

    if (students.length === 0) {
      throw new Error('当前班级没有学生，无法开始随机点名')
    }

    const rollCallStudents: RollCallStudent[] = students.map(student => ({
      studentId: student.id,
      name: student.name,
      studentNo: student.studentNo,
      avatar: student.avatar
    }))

    const session: RandomCallSession = {
      id: uuidv4(),
      classId: classId,
      startTime: new Date(),
      isCompleted: false,
      selectedStudents: [],
      excludeSelected: randomCallSettings.value.excludeSelected,
      students: rollCallStudents,
      history: [],
      settings: { ...randomCallSettings.value }
    }

    currentRandomCallSession.value = session
    antiRepeatPicker.reset()
    return session
  }

  // 执行随机选择（不立即添加历史记录）
  function performRandomPick(): RollCallStudent[] {
    if (!currentRandomCallSession.value) {
      throw new Error('没有进行中的随机点名会话')
    }

    const session = currentRandomCallSession.value
    const { pickCount, excludeSelected } = session.settings
    
    let availableStudents = session.students
    
    // 如果设置了排除已选择的学生
    if (excludeSelected && session.history.length > 0) {
      const selectedIds = new Set(session.history.flatMap(h => h.selectedStudents.map(s => s.studentId)))
      availableStudents = session.students.filter(s => !selectedIds.has(s.studentId))
    }

    if (availableStudents.length === 0) {
      throw new Error('没有可选择的学生')
    }
  
    // 使用防重复选择器进行随机选择
    const selectedStudents = antiRepeatPicker.pick(availableStudents, Math.min(pickCount, availableStudents.length))
  
    // 只返回选择结果，不立即添加到历史
    return selectedStudents
  }

  // 添加历史记录的函数
  function addToHistory(selectedStudents: RollCallStudent[]) {
    const session = currentRandomCallSession.value
    if (!session) return
    
    const historyRecord: RandomCallHistoryRecord = {
      id: uuidv4(),
      time: new Date(),
      selectedStudents
    }
    
    session.history.push(historyRecord)
  }

  return {
    attendanceRecords,
    currentRollCallSession,
    currentStudent,
    rollCallProgress,
    startRollCall,
    markAttendance,
    endRollCall,
    deleteAttendanceRecord,
    getAttendanceByClass,
    getAttendanceByDateRange,
    clearAllAttendanceRecords,
    loadAttendanceFromStorage,
    // 新增的随机点名功能
    currentRandomCallSession: readonly(currentRandomCallSession),
    randomCallSettings: readonly(randomCallSettings),
    startRandomCall,
    performRandomPick,
    addToHistory,  // 新增
    updateRandomCallSettings,
    endRandomCall
  }
})
