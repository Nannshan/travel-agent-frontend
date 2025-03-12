<template>
  <div class="not-found">
    <img src="../assets/404.jpg" alt="404" class="not-found-image" />
    <a-button type="primary" @click="$router.push('/user-star')" class="back-btn">
      返回首页
    </a-button>
  </div>
</template>

<script setup>
</script>

<style scoped>
.not-found {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.not-found-image {
  max-width: 80%;
  height: auto;
  margin-bottom: 24px;
}

.back-btn {
  font-size: 16px;
  height: 40px;
  padding: 0 32px;
}
</style> 