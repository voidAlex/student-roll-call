export interface Class {
  id: string
  name: string
  grade: string
  createdAt: Date
  updatedAt: Date
  studentCount: number
  note?: string
}

export interface ClassFormData {
  name: string
  grade: string
  note?: string
}
