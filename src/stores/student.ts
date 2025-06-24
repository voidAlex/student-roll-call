import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { Student, StudentFormData, ImportStudentData } from '@/types/student'
import { useClassStore } from './class'
import { generateRandomEmoji } from '@/utils/emoji'

export const useStudentStore = defineStore('student', () => {
  // 学生列表
  const students = ref<Student[]>([])
  
  // 搜索关键词
  const searchKeyword = ref('')
  
  // 获取当前班级的学生列表（未删除的）
  const currentClassStudents = computed(() => {
    const classStore = useClassStore()
    if (!classStore.currentClassId) return []
    
    return students.value.filter(student => 
      student.classId === classStore.currentClassId && 
      !student.isDeleted
    )
  })
  
  // 根据搜索关键词过滤学生
  const filteredStudents = computed(() => {
    if (!searchKeyword.value.trim()) {
      return currentClassStudents.value
    }
    
    const keyword = searchKeyword.value.toLowerCase()
    return currentClassStudents.value.filter(student => 
      student.name.toLowerCase().includes(keyword) ||
      student.studentNo.toLowerCase().includes(keyword)
    )
  })
  
  // 添加学生
  function addStudent(studentData: StudentFormData): Student {
    const classStore = useClassStore()
    if (!classStore.currentClassId) {
      throw new Error('请先选择班级')
    }
    
    // 检查学号是否重复
    const existingStudent = students.value.find(s => 
      s.classId === classStore.currentClassId && 
      s.studentNo === studentData.studentNo && 
      !s.isDeleted
    )
    
    if (existingStudent) {
      throw new Error('学号已存在')
    }
    
    const newStudent: Student = {
      id: uuidv4(),
      classId: classStore.currentClassId,
      studentNo: studentData.studentNo,
      name: studentData.name,
      gender: studentData.gender,
      // 如果没有提供头像，自动生成随机emoji
      avatar: studentData.avatar || generateRandomEmoji(),
      createdAt: new Date(),
      isDeleted: false
    }
    
    students.value.push(newStudent)
    updateClassStudentCount(classStore.currentClassId)
    saveStudentsToStorage()
    
    return newStudent
  }
  
  // 批量导入学生
  function importStudents(studentsData: StudentFormData[]): { success: number, errors: string[] } {
    const classStore = useClassStore()
    if (!classStore.currentClassId) {
      throw new Error('请先选择班级')
    }
    
    const errors: string[] = []
    let successCount = 0
    
    studentsData.forEach((studentData, index) => {
      try {
        // 检查必填字段
        if (!studentData.studentNo || !studentData.name) {
          errors.push(`第${index + 1}行：学号和姓名不能为空`)
          return
        }
        
        // 检查学号是否重复
        const existingStudent = students.value.find(s => 
          s.classId === classStore.currentClassId && 
          s.studentNo === studentData.studentNo && 
          !s.isDeleted
        )
        
        if (existingStudent) {
          errors.push(`第${index + 1}行：学号 ${studentData.studentNo} 已存在`)
          return
        }
        
        const newStudent: Student = {
          id: uuidv4(),
          classId: classStore.currentClassId!,
          studentNo: studentData.studentNo,
          name: studentData.name,
          gender: studentData.gender,
          avatar: studentData.avatar || generateRandomEmoji(), // 如果没有头像，生成随机emoji
          createdAt: new Date(),
          isDeleted: false
        }
        
        students.value.push(newStudent)
        successCount++
      } catch (error) {
        errors.push(`第${index + 1}行：${error instanceof Error ? error.message : '未知错误'}`)
      }
    })
    
    if (successCount > 0) {
      updateClassStudentCount(classStore.currentClassId!)
      saveStudentsToStorage()
    }
    
    return { success: successCount, errors }
  }
  
  // 编辑学生
  function updateStudent(id: string, studentData: Partial<StudentFormData>): Student | null {
    const index = students.value.findIndex(s => s.id === id)
    if (index === -1) return null
    
    // 如果修改学号，检查是否重复
    if (studentData.studentNo && studentData.studentNo !== students.value[index].studentNo) {
      const existingStudent = students.value.find(s => 
        s.classId === students.value[index].classId && 
        s.studentNo === studentData.studentNo && 
        !s.isDeleted &&
        s.id !== id
      )
      
      if (existingStudent) {
        throw new Error('学号已存在')
      }
    }
    
    const updatedStudent = {
      ...students.value[index],
      ...studentData
    }
    
    students.value[index] = updatedStudent
    saveStudentsToStorage()
    
    return updatedStudent
  }
  
  // 软删除学生
  function deleteStudent(id: string): boolean {
    const index = students.value.findIndex(s => s.id === id)
    if (index === -1) return false
    
    students.value[index].isDeleted = true
    updateClassStudentCount(students.value[index].classId)
    saveStudentsToStorage()
    
    return true
  }
  
  // 恢复学生
  function restoreStudent(id: string): boolean {
    const index = students.value.findIndex(s => s.id === id)
    if (index === -1) return false
    
    students.value[index].isDeleted = false
    updateClassStudentCount(students.value[index].classId)
    saveStudentsToStorage()
    
    return true
  }
  
  // 永久删除学生
  function permanentDeleteStudent(id: string): boolean {
    const index = students.value.findIndex(s => s.id === id)
    if (index === -1) return false
    
    const classId = students.value[index].classId
    students.value.splice(index, 1)
    updateClassStudentCount(classId)
    saveStudentsToStorage()
    
    return true
  }
  
  // 获取已删除的学生
  function getDeletedStudents(classId?: string): Student[] {
    return students.value.filter(student => 
      student.isDeleted && 
      (!classId || student.classId === classId)
    )
  }
  
  // 更新班级学生数量
  function updateClassStudentCount(classId: string): void {
    const classStore = useClassStore()
    const count = students.value.filter(s => s.classId === classId && !s.isDeleted).length
    classStore.updateClass(classId, { studentCount: count } as any)
  }
  
  // 设置搜索关键词
  function setSearchKeyword(keyword: string): void {
    searchKeyword.value = keyword
  }
  
  // 保存学生数据到本地存储
  function saveStudentsToStorage(): void {
    localStorage.setItem('students', JSON.stringify(students.value))
  }
  
  // 从本地存储加载学生数据
  function loadStudentsFromStorage(): void {
    const storedStudents = localStorage.getItem('students')
    if (storedStudents) {
      try {
        const parsedStudents = JSON.parse(storedStudents)
        students.value = parsedStudents.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt)
        }))
      } catch (error) {
        console.error('Failed to parse students from localStorage:', error)
      }
    }
  }
  
  // 初始化时加载数据
  loadStudentsFromStorage()
  
  return {
    students,
    searchKeyword,
    currentClassStudents,
    filteredStudents,
    addStudent,
    importStudents,
    updateStudent,
    deleteStudent,
    restoreStudent,
    permanentDeleteStudent,
    getDeletedStudents,
    setSearchKeyword,
    loadStudentsFromStorage
  }
})