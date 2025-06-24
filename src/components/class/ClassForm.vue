<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { useClassStore } from '../../stores/class'
import type { Class } from '../../types/class'
import { ElMessage } from 'element-plus'

interface Props {
  editClass?: Class | null
}

interface Emits {
  success: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const classStore = useClassStore()
const formRef = ref()
const loading = ref(false)

// 表单数据
const formData = reactive({
  name: '',
  grade: '',
  note: ''
})

// 年级选项
const gradeOptions = [
  { label: '七年级', value: '七年级' },
  { label: '八年级', value: '八年级' },
  { label: '九年级', value: '九年级' }
]

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' },
    { min: 1, max: 20, message: '班级名称长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  grade: [
    { required: true, message: '请选择年级', trigger: 'change' }
  ]
}

// 是否为编辑模式
const isEditMode = computed(() => {
  return !!props.editClass
})

// 重置表单 - 移到前面定义
const resetForm = () => {
  formData.name = ''
  formData.grade = ''
  formData.note = ''
  formRef.value?.clearValidate()
}

// 初始化表单数据
const initFormData = () => {
  if (props.editClass) {
    formData.name = props.editClass.name
    formData.grade = props.editClass.grade
    formData.note = props.editClass.note || ''
  } else {
    resetForm()
  }
}

// 监听编辑班级变化
watch(() => props.editClass, () => {
  initFormData()
}, { immediate: true })

// 组件挂载时初始化
onMounted(() => {
  initFormData()
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    if (isEditMode.value && props.editClass) {
      // 编辑班级
      const updatedClass = classStore.updateClass(props.editClass.id, formData)
      if (updatedClass) {
        ElMessage.success(`班级 "${updatedClass.name}" 更新成功！`)
      } else {
        ElMessage.error('更新失败，班级不存在')
        return
      }
    } else {
      // 添加班级
      const newClass = classStore.addClass(formData)
      ElMessage.success(`班级 "${newClass.name}" 创建成功！`)
    }
    
    // 重置表单
    resetForm()
    
    // 触发成功事件
    emit('success')
    
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  resetForm()
  emit('success')  // 关闭对话框
}
</script>

<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="80px"
    label-position="left"
  >
    <el-form-item label="班级名称" prop="name">
      <el-input
        v-model="formData.name"
        placeholder="请输入班级名称"
        clearable
      />
    </el-form-item>
    
    <el-form-item label="年级" prop="grade">
      <el-select
        v-model="formData.grade"
        placeholder="请选择年级"
        style="width: 100%"
      >
        <el-option
          v-for="option in gradeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
    
    <el-form-item label="备注" prop="note">
      <el-input
        v-model="formData.note"
        type="textarea"
        :rows="3"
        placeholder="请输入备注信息（可选）"
      />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        {{ isEditMode ? '更新班级' : '创建班级' }}
      </el-button>
      <el-button @click="handleCancel">
        取消
      </el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
/* 组件样式 */
</style>