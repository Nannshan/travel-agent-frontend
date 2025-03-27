<template>
  <div class="home-container">
    <nav class="navbar">
      <div class="logo">漫程方略</div>
      <div class="nav-links">
        <router-link to="/login?tab=login" class="nav-btn login-btn">登录</router-link>
        <router-link to="/login?tab=register" class="nav-btn signup-btn">注册</router-link>
      </div>
    </nav>

    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="text-content">
          <h1 class="hero-title">探索世界的新方式</h1>
          <p class="hero-subtitle">让AI为您定制完美旅行计划</p>
          <div class="features">
            <div class="feature-item">
              <span class="feature-icon">🎯</span>
              <span>智能规划路线</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🌈</span>
              <span>个性化推荐</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">⚡</span>
              <span>天气提醒</span>
            </div>
          </div>
          <button class="get-started-btn" @click="handleGetStarted">
            开始规划
            <span class="btn-icon">→</span>
          </button>
        </div>
      </div>
    </div>
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
  position: relative;
  background: #1a1a1a;
  color: white;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(218, 210, 125, 0.3);
  backdrop-filter: blur(2px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
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
  font-weight: 500;
}

.login-btn {
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.signup-btn {
  background: #3498db;
  color: white;
  border: 1px solid #3498db;
}

.signup-btn:hover {
  background: #2980b9;
  border-color: #2980b9;
}

.hero {
  height: 100vh;
  position: relative;
  background-image: url('@/assets/travel-illustration.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding: 0 4rem;
}

.text-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  background: linear-gradient(45deg, #3498db, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
}

.features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.get-started-btn {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.get-started-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.btn-icon {
  transition: transform 0.3s ease;
}

.get-started-btn:hover .btn-icon {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .hero-content {
    padding: 0 2rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .features {
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>
