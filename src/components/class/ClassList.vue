<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClassStore } from '../../stores/class'
import type { Class } from '../../types/class'
import { ElMessage } from 'element-plus'
import ClassCard from './ClassCard.vue'
import ClassForm from './ClassForm.vue'
import { Plus } from '@element-plus/icons-vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'

const classStore = useClassStore()
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingClass = ref<Class | null>(null)

// 添加动画状态
const isAdding = ref(false)
const newlyAddedId = ref<string | null>(null)

// 删除确认弹窗状态
const showDeleteConfirm = ref(false)
const deleteTarget = ref<Class | null>(null)

// 删除班级确认
const handleDeleteClass = (classItem: Class) => {
  deleteTarget.value = classItem
  showDeleteConfirm.value = true
}

// 确认删除
const confirmDelete = () => {
  if (deleteTarget.value) {
    const success = classStore.deleteClass(deleteTarget.value.id)
    if (success) {
      ElMessage.success('班级删除成功')
    } else {
      ElMessage.error('删除失败')
    }
    // Close dialog first, then clear target
    showDeleteConfirm.value = false
    deleteTarget.value = null
  }
}

// 取消删除
const cancelDelete = () => {
  // Close dialog first, then clear target
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

// 编辑班级
const handleEditClass = (classItem: Class) => {
  editingClass.value = classItem
  showEditForm.value = true
}

// 选择班级
const handleSelectClass = (classItem: Class) => {
  classStore.setCurrentClass(classItem.id)
}

// 添加班级
const handleAddClass = () => {
  showAddForm.value = true
}

// 保存新班级
const handleSaveClass = (classData: Omit<Class, 'id' | 'createdAt'>) => {
  isAdding.value = true
  const newClass = classStore.addClass(classData)
  newlyAddedId.value = newClass.id
  showAddForm.value = false

  // 2秒后移除新增动画
  setTimeout(() => {
    newlyAddedId.value = null
    isAdding.value = false
  }, 2000)
}

// 更新班级
const handleUpdateClass = (classData: Class) => {
  classStore.updateClass(classData)
  showEditForm.value = false
  editingClass.value = null
}

// 取消操作
const handleCancel = () => {
  showAddForm.value = false
  showEditForm.value = false
  editingClass.value = null
}

// 计算属性
const classList = computed(() => classStore.classes)
const currentClass = computed(() => classStore.currentClass)
</script>

<template>
  <div class="class-list">
    <!-- 头部操作栏 -->
    <div class="list-header">
      <h2 class="page-title">班级管理</h2>
      <el-button
        type="primary"
        :icon="Plus"
        @click="handleAddClass"
        class="add-button"
      >
        添加班级
      </el-button>
    </div>

    <!-- 班级网格 -->
    <div v-if="classList.length > 0" class="class-grid">
      <TransitionGroup name="class-list" tag="div" class="grid-container">
        <ClassCard
          v-for="classItem in classList"
          :key="classItem.id"
          :class-data="classItem"
          :is-current="currentClass?.id === classItem.id"
          :class="{ 'newly-added': newlyAddedId === classItem.id }"
          @select="handleSelectClass"
          @edit="handleEditClass"
          @delete="handleDeleteClass"
        />
      </TransitionGroup>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>还没有班级</h3>
      <p>点击上方按钮添加第一个班级</p>
    </div>

    <!-- 添加班级表单弹窗 -->
    <ClassForm
      v-if="showAddForm"
      :visible="showAddForm"
      title="添加班级"
      @save="handleSaveClass"
      @cancel="handleCancel"
    />

    <!-- 编辑班级表单弹窗 -->
    <ClassForm
      v-if="showEditForm && editingClass"
      :visible="showEditForm"
      :class-data="editingClass"
      title="编辑班级"
      @save="handleUpdateClass"
      @cancel="handleCancel"
    />

    <!-- 删除确认弹窗 -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="删除确认"
      :message="`确定要删除班级 '${deleteTarget?.name}' 吗？删除后将无法恢复！`"
      confirm-text="确定删除"
      cancel-text="取消"
      type="warning"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
.class-list {
  @apply p-6;
}

.list-header {
  @apply flex justify-between items-center mb-8;
}

.page-title {
  @apply text-2xl font-bold text-gray-800 m-0;
}

.add-button {
  @apply shadow-lg hover:shadow-xl transition-shadow duration-300;
}

.class-grid {
  @apply w-full;
}

.grid-container {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
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
