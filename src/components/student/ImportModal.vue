<template>
  <el-dialog
    :model-value="modelValue"
    title="批量导入学生"
    width="600px"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <div class="import-content">
      <!-- 步骤指示器 -->
      <el-steps :active="currentStep" align-center class="mb-6">
        <el-step title="选择文件" />
        <el-step title="预览数据" />
        <el-step title="导入完成" />
      </el-steps>
      
      <!-- 步骤1：选择文件 -->
      <div v-if="currentStep === 0" class="step-content">
        <div class="upload-area">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx,.xls"
            @change="handleFileSelect"
          >
            <div class="upload-dragger">
              <Icon icon="mdi:file-excel" class="upload-icon" />
              <div class="upload-text">
                <p>点击或拖拽Excel文件到此处</p>
                <p class="upload-hint">支持 .xlsx 和 .xls 格式</p>
              </div>
            </div>
          </el-upload>
        </div>
        
        <div class="upload-tips">
          <h4>导入说明：</h4>
          <ul>
            <li>Excel文件需包含：学号、姓名、性别三列</li>
            <li>第一行为表头，从第二行开始为学生数据</li>
            <li>学号和姓名为必填项，性别默认为"男"</li>
            <li>建议先下载模板文件进行填写</li>
          </ul>
        </div>
      </div>
      
      <!-- 步骤2：预览数据 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="preview-header">
          <h4>预览导入数据（共 {{ previewData.length }} 条）</h4>
          <el-button size="small" @click="currentStep = 0">重新选择</el-button>
        </div>
        
        <div class="preview-table">
          <el-table :data="previewData" max-height="300" border>
            <el-table-column prop="studentNo" label="学号" width="120" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column prop="gender" label="性别" width="80" />
          </el-table>
        </div>
      </div>
      
      <!-- 步骤3：导入完成 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="import-result">
          <Icon icon="mdi:check-circle" class="result-icon success" />
          <h3>导入完成</h3>
          <p>数据预览无误，点击确认导入按钮完成导入</p>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        
        <el-button 
          v-if="currentStep === 1"
          type="primary"
          @click="handleImport"
        >
          确认导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { UploadInstance, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import type { StudentFormData } from '@/types/student'
import { parseStudentExcel } from '@/utils/excel'

interface Props {
  modelValue: boolean
}

interface Emits {
  'update:modelValue': [value: boolean]
  import: [students: StudentFormData[]]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 组件引用
const uploadRef = ref<UploadInstance>()

// 响应式数据
const currentStep = ref(0)
const previewData = ref<StudentFormData[]>([])
const loading = ref(false)

// 处理文件选择
function handleFileSelect(file: UploadFile) {
  if (!file.raw) return
  
  loading.value = true
  
  parseStudentExcel(file.raw)
    .then((students) => {
      previewData.value = students
      currentStep.value = 1
      ElMessage.success(`成功解析 ${students.length} 条学生数据`)
    })
    .catch((error) => {
      ElMessage.error(error.message)
    })
    .finally(() => {
      loading.value = false
    })
}

// 确认导入
function handleImport() {
  emit('import', previewData.value)
  handleClose()
}

// 关闭对话框
function handleClose() {
  emit('update:modelValue', false)
  currentStep.value = 0
  previewData.value = []
  uploadRef.value?.clearFiles()
}
</script>

<style scoped>
.import-content {
  @apply min-h-[300px];
}

.step-content {
  @apply py-4;
}

.upload-area {
  @apply mb-6;
}

.upload-dragger {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-8;
  @apply flex flex-col items-center justify-center;
  @apply hover:border-blue-400 transition-colors cursor-pointer;
}

.upload-icon {
  @apply text-4xl text-blue-400 mb-4;
}

.upload-text p {
  @apply text-center text-gray-600;
}

.upload-hint {
  @apply text-sm text-gray-400 mt-1;
}

.upload-tips {
  @apply bg-blue-50 p-4 rounded-lg;
}

.upload-tips h4 {
  @apply font-semibold text-blue-800 mb-2;
}

.upload-tips ul {
  @apply list-disc list-inside text-sm text-blue-700 space-y-1;
}

.preview-header {
  @apply flex justify-between items-center mb-4;
}

.preview-header h4 {
  @apply font-semibold text-gray-800;
}

.preview-table {
  @apply border rounded-lg;
}

.import-result {
  @apply text-center py-8;
}

.result-icon {
  @apply text-6xl mb-4;
}

.result-icon.success {
  @apply text-green-500;
}

.import-result h3 {
  @apply text-xl font-semibold text-gray-800 mb-2;
}

.import-result p {
  @apply text-gray-600;
}

.dialog-footer {
  @apply flex justify-end gap-2;
}
</style>