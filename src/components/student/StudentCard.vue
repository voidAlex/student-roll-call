<template>
  <div class="student-card" :class="{ 'deleted': student.isDeleted }">
    <div class="student-avatar">
      <img 
        v-if="student.avatar" 
        :src="student.avatar" 
        :alt="student.name"
        class="avatar-img"
      />
      <div v-else class="avatar-placeholder">
        <Icon :icon="student.gender === '男' ? 'mdi:account-tie' : 'mdi:account-dress'" />
      </div>
    </div>
    
    <div class="student-info">
      <h3 class="student-name">{{ student.name }}</h3>
      <p class="student-no">学号：{{ student.studentNo }}</p>
      <span class="student-gender" :class="`gender-${student.gender}`">
        {{ student.gender }}
      </span>
    </div>
    
    <div class="student-actions">
      <el-button 
        v-if="!student.isDeleted"
        type="primary" 
        size="small" 
        @click="$emit('edit', student)"
      >
        编辑
      </el-button>
      
      <el-button 
        v-if="!student.isDeleted"
        type="danger" 
        size="small" 
        @click="$emit('delete', student)"
      >
        删除
      </el-button>
      
      <el-button 
        v-if="student.isDeleted"
        type="success" 
        size="small" 
        @click="$emit('restore', student)"
      >
        恢复
      </el-button>
      
      <el-button 
        v-if="student.isDeleted"
        type="danger" 
        size="small" 
        @click="$emit('permanentDelete', student)"
      >
        永久删除
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Student } from '@/types/student'
import { Icon } from '@iconify/vue'

interface Props {
  student: Student
}

interface Emits {
  edit: [student: Student]
  delete: [student: Student]
  restore: [student: Student]
  permanentDelete: [student: Student]
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.student-card {
  @apply bg-white rounded-lg shadow-md p-4 border border-gray-200 transition-all duration-300;
  @apply hover:shadow-lg hover:scale-105;
}

.student-card.deleted {
  @apply bg-gray-100 opacity-60;
}

.student-avatar {
  @apply flex justify-center mb-3;
}

.avatar-img {
  @apply w-16 h-16 rounded-full object-cover border-2 border-blue-200;
}

.avatar-placeholder {
  @apply w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500;
  @apply flex items-center justify-center text-white text-2xl;
}

.student-info {
  @apply text-center mb-4;
}

.student-name {
  @apply text-lg font-bold text-gray-800 mb-1;
}

.student-no {
  @apply text-sm text-gray-600 mb-2;
}

.student-gender {
  @apply inline-block px-2 py-1 rounded-full text-xs font-medium;
}

.gender-男 {
  @apply bg-blue-100 text-blue-800;
}

.gender-女 {
  @apply bg-pink-100 text-pink-800;
}

.student-actions {
  @apply flex gap-2 justify-center;
}
</style>