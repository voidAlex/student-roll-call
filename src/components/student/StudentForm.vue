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
        <div class="emoji-selector">
          <!-- 当前选择的emoji预览 -->
          <div class="current-emoji">
            <span class="emoji-preview">
              {{ formData.avatar || getDefaultEmojiByGender(formData.gender) }}
            </span>
            <span class="emoji-label">当前头像</span>
          </div>
          
          <!-- emoji选择按钮 -->
          <div class="emoji-actions">
            <el-button size="small" @click="showEmojiPicker = true">
              选择Emoji
            </el-button>
            
            <el-button 
              size="small" 
              @click="formData.avatar = generateRandomEmoji()"
            >
              随机生成
            </el-button>
            
            <el-button 
              v-if="formData.avatar"
              size="small" 
              type="danger" 
              @click="formData.avatar = ''"
            >
              重置
            </el-button>
          </div>
        </div>
      </el-form-item>
    </el-form>
    
    <!-- Emoji选择器弹窗 -->
    <el-dialog
      v-model="showEmojiPicker"
      title="选择Emoji头像"
      width="600px"
      append-to-body
    >
      <div class="emoji-picker">
        <el-tabs v-model="activeCategory">
          <el-tab-pane 
            v-for="(category, key) in EMOJI_CATEGORIES" 
            :key="key"
            :label="category.name" 
            :name="key"
          >
            <div class="emoji-grid">
              <div 
                v-for="emoji in category.emojis" 
                :key="emoji"
                class="emoji-item"
                :class="{ active: formData.avatar === emoji }"
                @click="selectEmoji(emoji)"
              >
                {{ emoji }}
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <template #footer>
        <el-button @click="showEmojiPicker = false">取消</el-button>
        <el-button type="primary" @click="showEmojiPicker = false">确定</el-button>
      </template>
    </el-dialog>
    
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
import type { Student, StudentFormData } from '@/types/student'
import { EMOJI_CATEGORIES, getDefaultEmojiByGender, generateRandomEmoji } from '@/utils/emoji'

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

// emoji选择器状态
const showEmojiPicker = ref(false)
const activeCategory = ref('people')

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

// 监听弹窗打开状态，为新学生自动生成随机emoji头像
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && !props.student) {
    // 弹窗打开且是添加新学生时，自动生成随机emoji头像
    formData.avatar = generateRandomEmoji()
  }
})

// 选择emoji
function selectEmoji(emoji: string) {
  formData.avatar = emoji
}

// 提交表单
function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      // 移除这里的随机生成逻辑，因为已经在弹窗打开时生成了
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
.emoji-selector {
  @apply flex items-center gap-4;
}

.current-emoji {
  @apply flex flex-col items-center;
}

.emoji-preview {
  @apply text-4xl mb-2 w-16 h-16 flex items-center justify-center;
  @apply border-2 border-gray-200 rounded-lg bg-gray-50;
}

.emoji-label {
  @apply text-xs text-gray-500;
}

.emoji-actions {
  @apply flex flex-col gap-2;
}

.emoji-picker {
  @apply max-h-96 overflow-y-auto;
}

.emoji-grid {
  @apply grid grid-cols-8 gap-2 p-4;
}

.emoji-item {
  @apply text-2xl p-2 rounded cursor-pointer text-center;
  @apply hover:bg-blue-50 transition-colors;
}

.emoji-item.active {
  @apply bg-blue-100 border-2 border-blue-400;
}

.dialog-footer {
  @apply flex justify-end gap-2;
}
</style>