// 在现有文件中添加以下类型定义

export interface RandomCallSession {
  id: string
  classId: string
  startTime: Date
  pickCount: number
  excludeSelected: boolean
  selectedStudents: RollCallStudent[]
  history: RandomCallHistory[]
  isActive: boolean
}

export interface RandomCallHistory {
  id: string
  time: Date
  selectedStudents: RollCallStudent[]
  pickCount: number
}

export interface RandomCallSettings {
  pickCount: number
  excludeSelected: boolean
  animationType: 'roulette' | 'slot-machine'
  enableSound: boolean
}