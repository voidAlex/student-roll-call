<template>
  <div class="student-card" :class="{ 'deleted': student.isDeleted }">
    <div class="student-avatar">
      <!-- 直接显示emoji头像 -->
      <div class="avatar-emoji" :class="getAvatarClass(student.gender)">
        <span class="emoji-icon">
          {{ student.avatar || getDefaultEmojiByGender(student.gender) }}
        </span>
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
        @click="$emit('permanent-delete', student)"
      >
        彻底删除
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Student } from '../../types/student'
import { getDefaultEmojiByGender } from '@/utils/emoji'

interface Props {
  student: Student
}

defineProps<Props>()

defineEmits<{
  edit: [student: Student]
  delete: [student: Student]
  restore: [student: Student]
  'permanent-delete': [student: Student]
}>()

// 获取头像样式类
function getAvatarClass(gender: string): string {
  if (gender === '女') {
    return 'avatar-女'
  }
  return 'avatar-男'
}
</script>

<style scoped>
.student-card {
  @apply bg-white rounded-lg shadow-md p-4 transition-all duration-200;
  @apply hover:shadow-lg border border-gray-200;
}

.student-card.deleted {
  @apply opacity-60 bg-gray-50;
}

.student-avatar {
  @apply flex justify-center mb-4;
}

.avatar-emoji {
  @apply w-16 h-16 rounded-full;
  @apply flex items-center justify-center;
  @apply transition-all duration-200 hover:scale-105;
  @apply border-2 border-white shadow-lg;
}

.emoji-icon {
  @apply text-3xl;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

/* 男生头像：蓝紫色渐变背景 */
.avatar-男 {
  @apply bg-gradient-to-br from-blue-400 to-purple-500;
}

/* 女生头像：粉红色渐变背景 */
.avatar-女 {
  @apply bg-gradient-to-br from-pink-400 to-rose-500;
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
  @apply flex gap-2 justify-center flex-wrap;
}
</style>