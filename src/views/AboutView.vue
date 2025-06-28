<template>
  <div class="about">
    <div class="about-content">
      <h1>关于我们</h1>
      <div class="emoji-section">
        💗📦🌶🌶<br>
        🐶🐱🐶👶
      </div>
    </div>
  </div>
</template>

<style scoped>
.about {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.about-content {
  text-align: center;
  background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 50%, #fd79a8 100%);
  padding: 60px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.about-content h1 {
  font-size: 3rem;
  margin-bottom: 30px;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.emoji-section {
  font-size: 4rem;
  line-height: 1.2;
  margin-top: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>
