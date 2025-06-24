<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useClassStore } from './stores/class'
import { onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const classStore = useClassStore()

// 组件挂载时加载班级数据
onMounted(() => {
  classStore.loadClassesFromStorage()
})

// 处理班级切换
const handleClassChange = (classId: string) => {
  classStore.setCurrentClass(classId)
  const selectedClass = classStore.classes.find(c => c.id === classId)
  if (selectedClass) {
    ElMessage.success(`已切换到班级：${selectedClass.name}`)
  }
}
</script>

<template>
  <div id="app">
    <!-- 顶部导航 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>初中生点名系统</h1>
        </div>
        
        <nav class="main-nav">
          <RouterLink to="/" class="nav-link">首页</RouterLink>
          <RouterLink to="/class-manage" class="nav-link">班级管理</RouterLink>
          <RouterLink to="/about" class="nav-link">关于</RouterLink>
        </nav>
        
        <!-- 班级切换下拉选择 -->
        <div class="class-selector">
          <div v-if="classStore.classes.length === 0" class="no-class">
            <el-tag type="info">暂无班级</el-tag>
          </div>
          
          <div v-else class="class-select-wrapper">
            <label class="select-label">当前班级：</label>
            <el-select
              :model-value="classStore.currentClassId"
              @change="handleClassChange"
              placeholder="请选择班级"
              class="class-select"
              size="default"
            >
              <el-option
                v-for="classItem in classStore.classes"
                :key="classItem.id"
                :label="`${classItem.name} (${classItem.grade})`"
                :value="classItem.id"
              >
                <div class="option-content">
                  <span class="class-name">{{ classItem.name }}</span>
                  <span class="class-info">
                    {{ classItem.grade }} · {{ classItem.studentCount }}人
                  </span>
                </div>
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  width: 100%;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.main-nav {
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.class-selector {
  display: flex;
  align-items: center;
  min-width: 200px;
}

.no-class {
  display: flex;
  align-items: center;
}

.class-select-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  white-space: nowrap;
}

.class-select {
  min-width: 180px;
}

.class-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.class-select :deep(.el-input__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.4);
}

.class-select :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.class-select :deep(.el-input__inner) {
  color: white;
}

.class-select :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.6);
}

.class-select :deep(.el-select__caret) {
  color: rgba(255, 255, 255, 0.8);
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.class-name {
  font-weight: 500;
  color: #303133;
}

.class-info {
  font-size: 0.8rem;
  color: #909399;
}

.app-main {
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
  width: 100%;
}

/* 只在真正的移动设备上应用响应式样式 */
@media (max-width: 768px) and (orientation: portrait) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 16px 20px;
    gap: 16px;
  }
  
  .main-nav {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  
  .class-selector {
    order: 2;
    width: 100%;
    justify-content: center;
  }
  
  .class-select-wrapper {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .class-select {
    width: 100%;
    max-width: 300px;
  }
  
  .app-main {
    min-height: calc(100vh - 120px);
  }
}

@media (max-width: 480px) and (orientation: portrait) {
  .logo h1 {
    font-size: 1.2rem;
  }
  
  .main-nav {
    gap: 16px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}
</style>
