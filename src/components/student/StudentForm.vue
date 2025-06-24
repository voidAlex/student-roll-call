<template>
  <el-dialog
    :model-value="modelValue"
    :title="student ? '编辑学生' : '添加学生'"
    width="500px"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="学号" prop="studentNo">
        <el-input
          v-model="formData.studentNo"
          placeholder="请输入学号"
          maxlength="20"
        />
      </el-form-item>
      
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入姓名"
          maxlength="10"
        />
      </el-form-item>
      
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="formData.gender">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="头像">
        <div class="avatar-upload">
          <div class="avatar-preview">
            <img 
              v-if="formData.avatar" 
              :src="formData.avatar" 
              alt="头像预览"
              class="preview-img"
            />
            <div v-else class="preview-placeholder">
              <Icon icon="mdi:camera" class="text-2xl" />
              <span class="text-sm">点击上传头像</span>
            </div>
          </div>
          
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />
          
          <div class="upload-actions">
            <el-button size="small" @click="$refs.fileInput.click()">
              选择图片
            </el-button>
            
            <el-button 
              v-if="formData.avatar"
              size="small" 
              type="danger" 
              @click="formData.avatar = ''"
            >
              删除
            </el-button>
          </div>
        </div>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Icon } from '@iconify/vue'
import type { Student, StudentFormData } from '@/types/student'

interface Props {
  modelValue: boolean
  student?: Student | null
}

interface Emits {
  'update:modelValue': [value: boolean]
  submit: [data: StudentFormData]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单引用
const formRef = ref<FormInstance>()
const fileInput = ref<HTMLInputElement>()

// 表单数据
const formData = reactive<StudentFormData>({
  studentNo: '',
  name: '',
  gender: '男',
  avatar: ''
})

// 表单验证规则
const rules: FormRules = {
  studentNo: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { min: 1, max: 20, message: '学号长度为1-20个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 1, max: 10, message: '姓名长度为1-10个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ]
}

// 监听学生数据变化，填充表单
watch(() => props.student, (student) => {
  if (student) {
    formData.studentNo = student.studentNo
    formData.name = student.name
    formData.gender = student.gender
    formData.avatar = student.avatar || ''
  } else {
    resetForm()
  }
}, { immediate: true })

// 处理文件选择
function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件')
    return
  }
  
  // 验证文件大小（限制2MB）
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过2MB')
    return
  }
  
  // 读取文件并转换为base64
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// 提交表单
function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('submit', { ...formData })
    }
  })
}

// 关闭对话框
function handleClose() {
  emit('update:modelValue', false)
  resetForm()
}

// 重置表单
function resetForm() {
  formData.studentNo = ''
  formData.name = ''
  formData.gender = '男'
  formData.avatar = ''
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.avatar-upload {
  @apply flex items-center gap-4;
}

.avatar-preview {
  @apply w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg;
  @apply flex items-center justify-center cursor-pointer;
  @apply hover:border-blue-400 transition-colors;
}

.preview-img {
  @apply w-full h-full object-cover rounded-lg;
}

.preview-placeholder {
  @apply flex flex-col items-center justify-center text-gray-400;
}

.upload-actions {
  @apply flex flex-col gap-2;
}

.dialog-footer {
  @apply flex justify-end gap-2;
}
</style>