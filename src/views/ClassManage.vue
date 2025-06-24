<script setup>
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
    <ClassList />
  </div>
</template>

<style scoped>
.class-manage {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>