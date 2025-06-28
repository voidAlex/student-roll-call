<script setup lang="ts">
import { computed } from 'vue'
import type { Class } from '../../types/class'
import dayjs from 'dayjs'
import { Edit, Delete, User, Calendar, School } from '@element-plus/icons-vue'

interface Props {
  classData: Class
  isCurrent?: boolean
}

interface Emits {
  select: [classData: Class]
  edit: [classData: Class]
  delete: [classData: Class]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 格式化创建时间
const formattedDate = computed(() => {
  return dayjs(props.classData.createdAt).format('YYYY-MM-DD')
})

// 卡片样式类
const cardClass = computed(() => {
  return [
    'class-card',
    {
      'class-card--current': props.isCurrent
    }
  ]
})

// 处理选择班级
const handleSelect = () => {
  emit('select', props.classData)
}

// 处理编辑班级
const handleEdit = () => {
  emit('edit', props.classData)
}

// 处理删除班级
const handleDelete = () => {
  emit('delete', props.classData)
}
</script>

<template>
  <div :class="cardClass" @click="handleSelect">
    <!-- 班级信息区域 -->
    <div class="class-info">
      <div class="class-header">
        <h3 class="class-name">{{ classData.name }}</h3>
        <el-tag v-if="isCurrent" type="success" size="default" class="current-tag">当前班级</el-tag>
      </div>
      
      <div class="class-details">
        <div class="detail-item">
          <el-icon class="detail-icon"><User /></el-icon>
          <span class="detail-text">{{ classData.studentCount }} 人</span>
        </div>
        
        <div class="detail-item">
          <el-icon class="detail-icon"><Calendar /></el-icon>
          <span class="detail-text">{{ formattedDate }}</span>
        </div>
        
        <div class="detail-item">
          <el-icon class="detail-icon"><School /></el-icon>
          <span class="detail-text">{{ classData.grade }}</span>
        </div>
      </div>
      
      <div v-if="classData.note" class="class-note">
        <p>{{ classData.note }}</p>
      </div>
    </div>
    
    <!-- 操作按钮区域 -->
    <div class="class-actions" @click.stop>
      <el-button 
        type="primary" 
        size="default" 
        @click="handleEdit"
        :icon="Edit"
        class="action-btn edit-btn"
      >
        编辑
      </el-button>
      
      <el-button 
        type="danger" 
        size="default" 
        @click="handleDelete"
        :icon="Delete"
        class="action-btn delete-btn"
      >
        删除
      </el-button>
    </div>
    
    <!-- 选中状态指示器 -->
    <div v-if="isCurrent" class="current-indicator"></div>
    
    <!-- 光泽效果 -->
    <div class="shine-effect"></div>
  </div>
</template>

<style scoped>
.class-card {
  position: relative;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #a29bfe 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.class-card--current {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 4px 16px rgba(17, 153, 142, 0.2);
}

.class-card--current:hover {
  box-shadow: 0 8px 24px rgba(17, 153, 142, 0.3);
}

/* 多巴胺渐变色方案 */
.class-card:nth-child(4n+1) {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #a29bfe 100%);
}

.class-card:nth-child(4n+2) {
  background: linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #e17055 100%);
}

.class-card:nth-child(4n+3) {
  background: linear-gradient(135deg, #55efc4 0%, #81ecec 50%, #74b9ff 100%);
}

.class-card:nth-child(4n+4) {
  background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 50%, #fd79a8 100%);
}

.class-info {
  flex: 1;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.class-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  line-height: 1.3;
}

.current-tag {
  font-weight: 500;
  font-size: 12px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #11998e;
}

.class-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  opacity: 0.9;
}

.detail-icon {
  font-size: 16px;
  min-width: 16px;
}

.detail-text {
  font-weight: 400;
}

.class-note {
  margin-top: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  font-size: 0.85rem;
  opacity: 0.9;
  backdrop-filter: blur(10px);
}

.class-note p {
  margin: 0;
  line-height: 1.4;
}

.class-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
}

.action-btn {
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-weight: 500;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.delete-btn:hover {
  background: rgba(245, 101, 101, 0.8) !important;
  color: white !important;
}

.current-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-top: 20px solid #ffd700;
}

.current-indicator::after {
  content: '✓';
  position: absolute;
  top: -18px;
  right: -8px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* 光泽效果 */
.shine-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
  pointer-events: none;
}

.class-card:hover .shine-effect {
  left: 100%;
}

/* 卡片出现动画 */
@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.class-card {
  animation: cardAppear 0.4s ease;
}
</style>