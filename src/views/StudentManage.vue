<template>
  <div class="student-manage-page">
    <div class="page-header">
      <h2>学生管理</h2>
      <p v-if="classStore.currentClass" class="current-class">
        当前班级：{{ classStore.currentClass.name }} ({{ classStore.currentClass.grade }})
      </p>
      <p v-else class="no-class-warning">
        请先在右上角选择或创建班级
      </p>
    </div>
    
    <div v-if="classStore.currentClass" class="page-content">
      <StudentList />
    </div>
    
    <div v-else class="no-class-state">
      <Icon icon="mdi:account-group-outline" class="empty-icon" />
      <h3>请先选择班级</h3>
      <p>学生管理需要先选择一个班级，请在右上角选择班级或前往班级管理创建新班级。</p>
      <el-button type="primary" @click="$router.push('/class-manage')">
        前往班级管理
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClassStore } from '@/stores/class'
import StudentList from '@/components/student/StudentList.vue'
import { Icon } from '@iconify/vue'

const classStore = useClassStore()
</script>

<style scoped>
.student-manage-page {
  @apply min-h-full;
}

.page-header {
  @apply bg-white shadow-sm border-b border-gray-200 px-6 py-4 mb-6;
}

.page-header h2 {
  @apply text-2xl font-bold text-gray-800 mb-2;
}

.current-class {
  @apply text-sm text-blue-600 font-medium;
}

.no-class-warning {
  @apply text-sm text-orange-600 font-medium;
}

.page-content {
  @apply px-6;
}

.no-class-state {
  @apply flex flex-col items-center justify-center py-20 text-center;
}

.empty-icon {
  @apply text-6xl text-gray-400 mb-4;
}

.no-class-state h3 {
  @apply text-xl font-semibold text-gray-600 mb-2;
}

.no-class-state p {
  @apply text-gray-500 mb-6 max-w-md;
}
</style>