<template>
  <div class="attendance-status">
    <div class="status-item" :class="{ active: status === 'present' }">
      <div class="status-icon">✓</div>
      <span>已到</span>
      <div class="count">{{ presentCount }}</div>
    </div>
    <div class="status-item" :class="{ active: status === 'absent' }">
      <div class="status-icon">✗</div>
      <span>未到</span>
      <div class="count">{{ absentCount }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  presentCount: number
  absentCount: number
  status?: 'present' | 'absent'
}

defineProps<Props>()
</script>

<style scoped>
.attendance-status {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.3s ease;
}

.status-item.active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.status-icon {
  font-size: 2rem;
  margin-bottom: 5px;
}

.count {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 5px;
}
</style>