import * as XLSX from 'xlsx'
import type { ImportStudentData } from '../types/student'
import type { AttendanceRecord } from '../types/attendance'

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

// 导出考勤报告
export function exportAttendanceReport(
  record: AttendanceRecord, 
  className: string,
  getStudentName: (id: string) => string,
  getStudentNo: (id: string) => string
): void {
  // 创建工作簿
  const wb = XLSX.utils.book_new()
  
  // 1. 考勤概要工作表
  const summaryData = [
    { '项目': '班级名称', '内容': className },
    { '项目': '点名日期', '内容': new Date(record.date).toLocaleString('zh-CN') },
    { '项目': '点名类型', '内容': record.type },
    { '项目': '总人数', '内容': record.summary.total },
    { '项目': '出勤人数', '内容': record.summary.present },
    { '项目': '缺勤人数', '内容': record.summary.absent },
    { '项目': '出勤率', '内容': `${record.summary.rate}%` }
  ]
  
  const summaryWs = XLSX.utils.json_to_sheet(summaryData)
  summaryWs['!cols'] = [
    { width: 15 }, // 项目
    { width: 25 }  // 内容
  ]
  XLSX.utils.book_append_sheet(wb, summaryWs, '考勤概要')
  
  // 2. 详细考勤工作表
  const detailData = record.details.map((detail, index) => ({
    '序号': index + 1,
    '学号': getStudentNo(detail.studentId),
    '姓名': getStudentName(detail.studentId),
    '出勤状态': detail.status,
    '点名时间': new Date(detail.time).toLocaleTimeString('zh-CN')
  }))
  
  const detailWs = XLSX.utils.json_to_sheet(detailData)
  detailWs['!cols'] = [
    { width: 8 },  // 序号
    { width: 15 }, // 学号
    { width: 20 }, // 姓名
    { width: 12 }, // 出勤状态
    { width: 15 }  // 点名时间
  ]
  
  // 设置出勤状态列的样式
  const range = XLSX.utils.decode_range(detailWs['!ref'] || 'A1')
  for (let row = 1; row <= range.e.r; row++) {
    const statusCell = detailWs[XLSX.utils.encode_cell({ r: row, c: 3 })]
    if (statusCell && statusCell.v === '未到') {
      statusCell.s = {
        fill: { fgColor: { rgb: 'FFEBEE' } },
        font: { color: { rgb: 'D32F2F' } }
      }
    } else if (statusCell && statusCell.v === '已到') {
      statusCell.s = {
        fill: { fgColor: { rgb: 'E8F5E8' } },
        font: { color: { rgb: '4CAF50' } }
      }
    }
  }
  
  XLSX.utils.book_append_sheet(wb, detailWs, '详细考勤')
  
  // 3. 缺勤学生汇总（如果有缺勤学生）
  const absentStudents = record.details.filter(d => d.status === '未到')
  if (absentStudents.length > 0) {
    const absentData = absentStudents.map((detail, index) => ({
      '序号': index + 1,
      '学号': getStudentNo(detail.studentId),
      '姓名': getStudentName(detail.studentId),
      '缺勤时间': new Date(detail.time).toLocaleTimeString('zh-CN')
    }))
    
    const absentWs = XLSX.utils.json_to_sheet(absentData)
    absentWs['!cols'] = [
      { width: 8 },  // 序号
      { width: 15 }, // 学号
      { width: 20 }, // 姓名
      { width: 15 }  // 缺勤时间
    ]
    
    XLSX.utils.book_append_sheet(wb, absentWs, '缺勤学生')
  }
  
  // 生成文件名
  const dateStr = new Date(record.date).toISOString().split('T')[0]
  const fileName = `${className}_考勤报告_${dateStr}.xlsx`
  
  // 下载文件
  XLSX.writeFile(wb, fileName)
}

// 导出多个考勤报告汇总
export function exportAttendanceReports(
  records: AttendanceRecord[],
  getClassName: (id: string) => string,
  getStudentName: (id: string) => string,
  getStudentNo: (id: string) => string
): void {
  const wb = XLSX.utils.book_new()
  
  // 汇总数据
  const summaryData = records.map((record, index) => ({
    '序号': index + 1,
    '班级': getClassName(record.classId),
    '日期': new Date(record.date).toLocaleDateString('zh-CN'),
    '时间': new Date(record.date).toLocaleTimeString('zh-CN'),
    '类型': record.type,
    '总人数': record.summary.total,
    '出勤人数': record.summary.present,
    '缺勤人数': record.summary.absent,
    '出勤率': `${record.summary.rate}%`
  }))
  
  const summaryWs = XLSX.utils.json_to_sheet(summaryData)
  summaryWs['!cols'] = [
    { width: 8 },  // 序号
    { width: 15 }, // 班级
    { width: 12 }, // 日期
    { width: 10 }, // 时间
    { width: 12 }, // 类型
    { width: 10 }, // 总人数
    { width: 10 }, // 出勤人数
    { width: 10 }, // 缺勤人数
    { width: 10 }  // 出勤率
  ]
  
  XLSX.utils.book_append_sheet(wb, summaryWs, '考勤汇总')
  
  const fileName = `考勤报告汇总_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}