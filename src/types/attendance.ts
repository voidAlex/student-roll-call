export interface AttendanceRecord {
  id: string
  classId: string
  date: Date
  type: '全员点名' | '随机点名'
  details: AttendanceDetail[]
  summary: {
    total: number
    present: number
    absent: number
    rate: number
  }
}

export interface AttendanceDetail {
  studentId: string
  status: '已到' | '未到'
  time: Date
}

export interface RollCallSession {
  id: string
  classId: string
  startTime: Date
  currentIndex: number
  isCompleted: boolean
  students: RollCallStudent[]
}

export interface RollCallStudent {
  studentId: string
  name: string
  studentNo: string
  avatar?: string
  status?: '已到' | '未到'
  time?: Date
}

export interface RandomCallSettings {
  pickCount: number
  excludeSelected: boolean
  enableSound: boolean
}

export interface RandomCallHistoryRecord {
  id: string
  time: Date
  selectedStudents: RollCallStudent[]
}

export interface RandomCallSession {
  id: string
  classId: string
  startTime: Date
  settings: RandomCallSettings
  isCompleted: boolean
  selectedStudents: RollCallStudent[]
  history: RandomCallHistoryRecord[]
  excludeSelected: boolean
  students: RollCallStudent[]
}