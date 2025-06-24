<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClassStore } from '../../stores/class'
import type { Class } from '../../types/class'
import { ElMessage, ElMessageBox } from 'element-plus'
import ClassCard from './ClassCard.vue'
import ClassForm from './ClassForm.vue'
import { Plus } from '@element-plus/icons-vue'

const classStore = useClassStore()
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingClass = ref<Class | null>(null)

// 添加动画状态
const isAdding = ref(false)
const newlyAddedId = ref<string | null>(null)

// 删除班级确认
const handleDeleteClass = (classItem: Class) => {
  ElMessageBox.confirm(
    `确定要删除班级 "${classItem.name}" 吗？删除后将无法恢复！`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const success = classStore.deleteClass(classItem.id)
    if (success) {
      ElMessage.success('班级删除成功')
    } else {
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 编辑班级
const handleEditClass = (classItem: Class) => {
  editingClass.value = classItem
  showEditForm.value = true
}

// 选择班级
const handleSelectClass = (classItem: Class) => {
  classStore.setCurrentClass(classItem.id)
  ElMessage.success(`已切换到班级：${classItem.name}`)
}

// 添加班级成功
const handleAddSuccess = () => {
  showAddForm.value = false
  // 触发新增动画
  isAdding.value = true
  // 获取最新添加的班级ID
  const latestClass = classStore.classes[classStore.classes.length - 1]
  if (latestClass) {
    newlyAddedId.value = latestClass.id
    // 3秒后清除新增状态
    setTimeout(() => {
      newlyAddedId.value = null
      isAdding.value = false
    }, 3000)
  }
}

// 编辑班级成功
const handleEditSuccess = () => {
  showEditForm.value = false
  editingClass.value = null
}
</script>

<template>
  <div class="class-list">
    <div class="header">
      <h2 class="title">班级管理</h2>
      <el-button 
        type="primary" 
        @click="showAddForm = true"
        :loading="isAdding"
        class="add-button"
        size="large"
      >
        <el-icon><Plus /></el-icon>
        添加班级
      </el-button>
    </div>
    
    <transition-group 
      name="class-list" 
      tag="div" 
      class="class-grid" 
      v-if="classStore.classes.length > 0"
    >
      <div
        v-for="classItem in classStore.classes" 
        :key="classItem.id"
        :class="{
          'class-item': true,
          'newly-added': newlyAddedId === classItem.id
        }"
      >
        <ClassCard 
          :class-data="classItem"
          :is-current="classStore.currentClassId === classItem.id"
          @edit="handleEditClass"
          @delete="handleDeleteClass"
          @select="handleSelectClass"
        />
      </div>
    </transition-group>
    
    <div class="empty-state" v-else>
      <div class="empty-icon">📚</div>
      <h3>暂无班级</h3>
      <p>点击上方按钮添加第一个班级开始管理</p>
    </div>
    
    <!-- 添加班级表单对话框 -->    
    <el-dialog 
      v-model="showAddForm" 
      title="添加班级" 
      width="600px"
      :before-close="() => { showAddForm = false }"
    >
      <ClassForm @success="handleAddSuccess" />
    </el-dialog>
    
    <!-- 编辑班级表单对话框 -->
    <el-dialog 
      v-model="showEditForm" 
      title="编辑班级" 
      width="600px"
      :before-close="() => { showEditForm = false; editingClass = null }"
    >
      <ClassForm :edit-class="editingClass" @success="handleEditSuccess" />
    </el-dialog>
  </div>
</template>

<style scoped>
.class-list {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.add-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.add-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 0;
}

.class-item {
  position: relative;
}

/* 新增班级动画 */
.newly-added {
  animation: celebrateNew 2s ease-in-out;
}

@keyframes celebrateNew {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

/* 列表项动画 */
.class-list-enter-active {
  transition: all 0.4s ease;
}

.class-list-leave-active {
  transition: all 0.3s ease;
}

.class-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.class-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.class-list-move {
  transition: transform 0.3s ease;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #2c3e50;
  margin: 16px 0 8px 0;
}

.empty-state p {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
}
</style>