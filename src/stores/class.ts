import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// 临时改为相对路径
import type { Class, ClassFormData } from '../types/class'
import { v4 as uuidv4 } from 'uuid' // 需要安装: npm install uuid @types/uuid

export const useClassStore = defineStore('class', () => {
  // 班级列表
  const classes = ref<Class[]>([])
  
  // 当前选中的班级ID
  const currentClassId = ref<string | null>(null)
  
  // 获取当前选中的班级
  const currentClass = computed(() => {
    return classes.value.find(c => c.id === currentClassId.value) || null
  })
  
  // 添加班级
  function addClass(classData: ClassFormData): Class {
    const newClass: Class = {
      id: uuidv4(),
      name: classData.name,
      grade: classData.grade,
      createdAt: new Date(),
      updatedAt: new Date(),
      studentCount: 0,
      note: classData.note
    }
    
    classes.value.push(newClass)
    saveClassesToStorage()
    
    // 如果是第一个班级，自动设为当前班级
    if (classes.value.length === 1) {
      currentClassId.value = newClass.id
    }
    
    return newClass
  }
  
  // 编辑班级
  function updateClass(id: string, classData: Partial<ClassFormData>): Class | null {
    const index = classes.value.findIndex(c => c.id === id)
    if (index === -1) return null
    
    const updatedClass = {
      ...classes.value[index],
      ...classData,
      updatedAt: new Date()
    }
    
    classes.value[index] = updatedClass
    saveClassesToStorage()
    
    return updatedClass
  }
  
  // 删除班级
  function deleteClass(id: string): boolean {
    const index = classes.value.findIndex(c => c.id === id)
    if (index === -1) return false
    
    classes.value.splice(index, 1)
    
    // 如果删除的是当前选中的班级，重置当前班级
    if (currentClassId.value === id) {
      currentClassId.value = classes.value.length > 0 ? classes.value[0].id : null
    }
    
    saveClassesToStorage()
    return true
  }
  
  // 设置当前班级
  function setCurrentClass(id: string | null): void {
    currentClassId.value = id
  }
  
  // 保存班级数据到本地存储
  function saveClassesToStorage(): void {
    localStorage.setItem('classes', JSON.stringify(classes.value))
  }
  
  // 从本地存储加载班级数据
  function loadClassesFromStorage(): void {
    const storedClasses = localStorage.getItem('classes')
    if (storedClasses) {
      try {
        const parsedClasses = JSON.parse(storedClasses)
        // 转换日期字符串为Date对象
        classes.value = parsedClasses.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt)
        }))
        
        // 设置当前班级
        if (classes.value.length > 0 && !currentClassId.value) {
          currentClassId.value = classes.value[0].id
        }
      } catch (error) {
        console.error('Failed to parse classes from localStorage:', error)
      }
    }
  }
  
  // 初始化时加载数据
  loadClassesFromStorage()
  
  return {
    classes,
    currentClassId,
    currentClass,
    addClass,
    updateClass,
    deleteClass,
    setCurrentClass,
    loadClassesFromStorage
  }
})