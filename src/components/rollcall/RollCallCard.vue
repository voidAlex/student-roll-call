<template>
  <div class="roll-call-card" :class="{ 'is-flipping': isFlipping }">
    <div class="card-inner">
      <div class="card-front">
        <div class="student-avatar">
          <div class="avatar-circle">
            {{ student.avatar || '👤' }}
          </div>
        </div>
        <div class="student-info">
          <h3 class="student-name">{{ student.name }}</h3>
          <p class="student-no">学号：{{ student.studentNo }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RollCallStudent } from '@/types/attendance'

interface Props {
  student: RollCallStudent
}

defineProps<Props>()

const isFlipping = ref(false)

function flip() {
  isFlipping.value = true
  setTimeout(() => {
    isFlipping.value = false
  }, 600)
}

defineExpose({ flip })
</script>

<style scoped>
.roll-call-card {
  width: 400px;
  height: 300px;
  perspective: 1000px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.is-flipping .card-inner {
  transform: rotateY(180deg);
}

.card-front {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  margin-bottom: 20px;
}

.student-name {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
  font-weight: bold;
}

.student-no {
  color: #666;
  font-size: 1.1rem;
}
</style>