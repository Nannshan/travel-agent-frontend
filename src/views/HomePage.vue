<template>
  <div class="home-container">
    <nav class="navbar">
      <div class="logo">Travel Agent</div>
      <div class="nav-links">
        <router-link to="/login?tab=login" class="nav-btn login-btn">登录</router-link>
        <router-link to="/login?tab=register" class="nav-btn signup-btn">注册</router-link>
      </div>
    </nav>

    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">探索世界的新方式</h1>
        <p class="hero-subtitle">让我们为您打造完美的旅行体验</p>
        <button class="get-started-btn" @click="handleGetStarted">开始体验</button>
      </div>
      <div class="hero-image">
        <img src="@/assets/travel-illustration.jpg" alt="Travel illustration">
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGetStarted = () => {
  router.push('/agent')
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-btn {
  color: #2c3e50;
}

.login-btn:hover {
  background: rgba(44, 62, 80, 0.1);
}

.signup-btn {
  background: #2c3e50;
  color: white;
}

.signup-btn:hover {
  background: #34495e;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rem 4rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #34495e;
  margin-bottom: 2rem;
}

.get-started-btn {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.get-started-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    padding: 6rem 2rem 2rem;
    text-align: center;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-image {
    order: -1;
  }
}
</style>
