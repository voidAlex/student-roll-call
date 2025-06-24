export interface Student {
  id: string
  classId: string
  studentNo: string
  name: string
  gender: '男' | '女'
  avatar?: string
  createdAt: Date
  isDeleted: boolean
}

export interface StudentFormData {
  studentNo: string
  name: string
  gender: '男' | '女'
  avatar?: string
}

export interface ImportStudentData {
  studentNo: string
  name: string
  gender: '男' | '女'
}