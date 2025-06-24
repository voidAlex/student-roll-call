<template>
  <div class="student-manage-page">
    <div class="page-header">
      <h2>学生管理</h2>
      <p class="subtitle">管理班级学生信息</p>
    </div>
    
    <div v-if="classStore.currentClass" class="page-content">
      <!-- 移除了class-info-card白色框 -->
      <StudentList />
    </div>
    
    <div v-else class="no-class-state">
      <div class="empty-card">
        <div class="empty-icon">👥</div>
        <h3>请先选择班级</h3>
        <p>学生管理需要先选择一个班级，请在右上角选择班级或前往班级管理创建新班级。</p>
        <button class="action-btn" @click="$router.push('/class-manage')">
          前往班级管理
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClassStore } from '@/stores/class'
import StudentList from '@/components/student/StudentList.vue'

const classStore = useClassStore()
</script>

<style scoped>
.student-manage-page {
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

.class-info-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.class-info-card h2 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 2rem;
  font-weight: bold;
}

.current-class {
  margin: 0;
  color: #667eea;
  font-weight: 600;
  font-size: 1.1rem;
}

.no-class-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.empty-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-card h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.8rem;
  font-weight: bold;
}

.empty-card p {
  margin: 0 0 30px 0;
  color: #666;
  line-height: 1.6;
  font-size: 1.1rem;
}

.action-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
}
</style>