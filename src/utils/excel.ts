import * as XLSX from 'xlsx'
import type { ImportStudentData } from '../types/student'

// 学生导入模板列名映射
const STUDENT_COLUMNS = {
  studentNo: ['学号', '学生学号', 'studentNo', 'student_no'],
  name: ['姓名', '学生姓名', 'name', 'student_name'],
  gender: ['性别', 'gender']
}

// 导出学生模板
export function exportStudentTemplate(): void {
  const templateData = [
    {
      '学号': '2024001',
      '姓名': '张三',
      '性别': '男'
    },
    {
      '学号': '2024002', 
      '姓名': '李四',
      '性别': '女'
    }
  ]
  
  const ws = XLSX.utils.json_to_sheet(templateData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '学生名单模板')
  
  // 设置列宽
  ws['!cols'] = [
    { width: 15 }, // 学号
    { width: 20 }, // 姓名
    { width: 10 }  // 性别
  ]
  
  XLSX.writeFile(wb, '学生名单导入模板.xlsx')
}

// 解析Excel文件
export function parseStudentExcel(file: File): Promise<ImportStudentData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // 取第一个工作表
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length < 2) {
          reject(new Error('Excel文件至少需要包含表头和一行数据'))
          return
        }
        
        // 解析表头
        const headers = jsonData[0] as string[]
        const columnMapping = mapColumns(headers)
        
        // 解析数据行
        const students: ImportStudentData[] = []
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[]
          
          // 跳过空行
          if (!row || row.every(cell => !cell)) continue
          
          const student: Partial<ImportStudentData> = {}
          
          // 映射数据
          if (columnMapping.studentNo !== -1) {
            student.studentNo = String(row[columnMapping.studentNo] || '').trim()
          }
          
          if (columnMapping.name !== -1) {
            student.name = String(row[columnMapping.name] || '').trim()
          }
          
          if (columnMapping.gender !== -1) {
            const gender = String(row[columnMapping.gender] || '').trim()
            student.gender = gender === '男' || gender === '女' ? gender : '男'
          }
          
          // 验证必填字段
          if (!student.studentNo || !student.name) {
            continue // 跳过无效行
          }
          
          students.push(student as ImportStudentData)
        }
        
        if (students.length === 0) {
          reject(new Error('未找到有效的学生数据'))
          return
        }
        
        resolve(students)
      } catch (error) {
        reject(new Error(`解析Excel文件失败: ${error instanceof Error ? error.message : '未知错误'}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

// 映射列名到索引
function mapColumns(headers: string[]): { studentNo: number, name: number, gender: number } {
  const mapping = {
    studentNo: -1,
    name: -1,
    gender: -1
  }
  
  headers.forEach((header, index) => {
    const normalizedHeader = header.trim()
    
    // 匹配学号列
    if (STUDENT_COLUMNS.studentNo.some(col => 
      normalizedHeader.includes(col) || col.includes(normalizedHeader)
    )) {
      mapping.studentNo = index
    }
    
    // 匹配姓名列
    if (STUDENT_COLUMNS.name.some(col => 
      normalizedHeader.includes(col) || col.includes(normalizedHeader)
    )) {
      mapping.name = index
    }
    
    // 匹配性别列
    if (STUDENT_COLUMNS.gender.some(col => 
      normalizedHeader.includes(col) || col.includes(normalizedHeader)
    )) {
      mapping.gender = index
    }
  })
  
  return mapping
}

// 导出学生名单
export function exportStudentList(students: ImportStudentData[], className: string): void {
  const exportData = students.map(student => ({
    '学号': student.studentNo,
    '姓名': student.name,
    '性别': student.gender
  }))
  
  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '学生名单')
  
  // 设置列宽
  ws['!cols'] = [
    { width: 15 }, // 学号
    { width: 20 }, // 姓名
    { width: 10 }  // 性别
  ]
  
  const fileName = `${className}_学生名单_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}