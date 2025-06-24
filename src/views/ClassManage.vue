<script setup lang="ts">
import { onMounted } from 'vue'
import { useClassStore } from '../stores/class'
import ClassList from '../components/class/ClassList.vue'

const classStore = useClassStore()

// 组件挂载时加载数据
onMounted(() => {
  classStore.loadClassesFromStorage()
})
</script>

<template>
  <div class="class-manage">
    <div class="page-header">
      <h2>班级管理</h2>
      <!-- 移除了subtitle黑色字 -->
    </div>
    <div class="page-content">
      <ClassList />
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.class-manage {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.page-header h2 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 600;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style>