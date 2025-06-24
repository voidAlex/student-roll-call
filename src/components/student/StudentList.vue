<template>
  <div class="student-list">
    <!-- 搜索和操作栏 -->
    <div class="list-header">
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学生姓名或学号"
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" @click="showAddDialog = true">
          <Icon icon="mdi:plus" class="mr-1" />
          添加学生
        </el-button>
        
        <el-button type="success" @click="showImportDialog = true">
          <Icon icon="mdi:file-excel" class="mr-1" />
          批量导入
        </el-button>
        
        <el-button @click="exportTemplate">
          <Icon icon="mdi:download" class="mr-1" />
          下载模板
        </el-button>
        
        <el-button 
          v-if="currentClassStudents.length > 0"
          @click="exportStudentList"
        >
          <Icon icon="mdi:export" class="mr-1" />
          导出名单
        </el-button>
      </div>
    </div>
    
    <!-- 学生卡片网格 -->
    <div v-if="filteredStudents.length > 0" class="student-grid">
      <StudentCard
        v-for="student in filteredStudents"
        :key="student.id"
        :student="student"
        @edit="handleEdit"
        @delete="handleDelete"
        @restore="handleRestore"
        @permanent-delete="handlePermanentDelete"
      />
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state">
      <Icon icon="mdi:account-group-outline" class="empty-icon" />
      <h3>{{ searchKeyword ? '未找到匹配的学生' : '暂无学生' }}</h3>
      <p>{{ searchKeyword ? '请尝试其他搜索关键词' : '点击上方按钮添加学生或批量导入' }}</p>
    </div>
    
    <!-- 添加/编辑学生对话框 -->
    <StudentForm
      v-model="showAddDialog"
      :student="editingStudent"
      @submit="handleSubmit"
    />
    
    <!-- 导入对话框 -->
    <ImportModal
      v-model="showImportDialog"
      @import="handleImport"
    />
    
    <!-- 普通删除确认弹窗 -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="确认删除"
      :message="`确定要删除学生 ${deleteTarget?.name} 吗？删除后可以在回收站中恢复。`"
      confirm-text="确定"
      cancel-text="取消"
      type="warning"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
    
    <!-- 永久删除确认弹窗 -->
    <ConfirmDialog
      v-model="showPermanentDeleteConfirm"
      title="确认永久删除"
      :message="`确定要永久删除学生 ${deleteTarget?.name} 吗？此操作不可恢复！`"
      confirm-text="确定"
      cancel-text="取消"
      type="error"
      @confirm="confirmPermanentDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'
import { useStudentStore } from '@/stores/student'
import { useClassStore } from '@/stores/class'
import type { Student, StudentFormData } from '@/types/student'
import StudentCard from './StudentCard.vue'
import StudentForm from './StudentForm.vue'
import ImportModal from './ImportModal.vue'
import { exportStudentTemplate, exportStudentList as exportList } from '@/utils/excel'
import ConfirmDialog from '../common/ConfirmDialog.vue'

const studentStore = useStudentStore()
const classStore = useClassStore()

// 响应式数据
const showAddDialog = ref(false)
const showImportDialog = ref(false)
const editingStudent = ref<Student | null>(null)
const searchKeyword = ref('')

// 删除确认弹窗状态
const showDeleteConfirm = ref(false)
const showPermanentDeleteConfirm = ref(false)
const deleteTarget = ref<Student | null>(null)

// 计算属性
const currentClassStudents = computed(() => studentStore.currentClassStudents)
const filteredStudents = computed(() => studentStore.filteredStudents)

// 搜索处理
function handleSearch(keyword: string) {
  studentStore.setSearchKeyword(keyword)
}

// 添加学生
function handleSubmit(studentData: StudentFormData) {
  try {
    if (editingStudent.value) {
      // 编辑模式
      studentStore.updateStudent(editingStudent.value.id, studentData)
      ElMessage.success('学生信息更新成功')
    } else {
      // 添加模式
      studentStore.addStudent(studentData)
      ElMessage.success('学生添加成功')
    }
    
    showAddDialog.value = false
    editingStudent.value = null
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  }
}

// 编辑学生
function handleEdit(student: Student) {
  editingStudent.value = student
  showAddDialog.value = true
}

// 删除学生
function handleDelete(student: Student) {
  deleteTarget.value = student
  showDeleteConfirm.value = true
}

// 永久删除学生
function handlePermanentDelete(student: Student) {
  deleteTarget.value = student
  showPermanentDeleteConfirm.value = true
}

// 确认删除
const confirmDelete = () => {
  if (deleteTarget.value) {
    studentStore.deleteStudent(deleteTarget.value.id)
    ElMessage.success('学生已删除')
    deleteTarget.value = null
  }
}

// 确认永久删除
const confirmPermanentDelete = () => {
  if (deleteTarget.value) {
    studentStore.permanentDeleteStudent(deleteTarget.value.id)
    ElMessage.success('学生已永久删除')
    deleteTarget.value = null
  }
}

// 取消删除
const cancelDelete = () => {
  deleteTarget.value = null
}

// 恢复学生
function handleRestore(student: Student) {
  studentStore.restoreStudent(student.id)
  ElMessage.success('学生已恢复')
}

// 批量导入
function handleImport(students: StudentFormData[]) {
  const result = studentStore.importStudents(students)
  
  if (result.errors.length > 0) {
    ElMessage.warning(`导入完成，但有 ${result.errors.length} 条记录存在问题`)
    console.warn('导入错误:', result.errors)
  } else {
    ElMessage.success(`成功导入 ${result.success} 名学生`)
  }
  
  showImportDialog.value = false
}

// 导出模板
function exportTemplate() {
  exportStudentTemplate()
  ElMessage.success('模板下载成功')
}

// 导出学生名单
function exportStudentList() {
  if (!classStore.currentClass) {
    ElMessage.error('请先选择班级')
    return
  }
  
  const students = currentClassStudents.value.map(s => ({
    studentNo: s.studentNo,
    name: s.name,
    gender: s.gender
  }))
  
  exportList(students, classStore.currentClass.name)
  ElMessage.success('名单导出成功')
}
</script>

<style scoped>
.student-list {
  @apply p-6;
}

.list-header {
  @apply flex justify-between items-center mb-6 gap-4;
}

.search-box {
  @apply flex-1 max-w-md;
}

.action-buttons {
  @apply flex gap-2;
}

.student-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4;
}

.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-6xl text-gray-400 mb-4;
}

.empty-state h3 {
  @apply text-xl font-semibold text-gray-600 mb-2;
}

.empty-state p {
  @apply text-gray-500;
}
</style>