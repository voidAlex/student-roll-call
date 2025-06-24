<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="400px"
    :modal="false"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    center
    class="confirm-dialog"
  >
    <div class="dialog-content">
      <el-icon class="warning-icon" v-if="type === 'warning'">
        <Warning />
      </el-icon>
      <el-icon class="error-icon" v-if="type === 'error'">
        <CircleClose />
      </el-icon>
      <p class="message-text">{{ message }}</p>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">{{ cancelText }}</el-button>
        <el-button 
          :type="type === 'error' ? 'danger' : 'warning'" 
          @click="handleConfirm"
        >
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Warning, CircleClose } from '@element-plus/icons-vue'

interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'error'
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: '确定',
  cancelText: '取消',
  type: 'warning'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const visible = ref(false)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleConfirm = () => {
  visible.value = false
  emit('confirm')
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}
</script>

<style scoped>
.confirm-dialog {
  --el-dialog-bg-color: #ffffff;
  --el-dialog-box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.dialog-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}

.warning-icon {
  color: #e6a23c;
  font-size: 24px;
  flex-shrink: 0;
}

.error-icon {
  color: #f56c6c;
  font-size: 24px;
  flex-shrink: 0;
}

.message-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

:deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 20px;
  border-top: 1px solid #ebeef5;
}
</style>