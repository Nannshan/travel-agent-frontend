<template>
  <div class="statistics-container">
    <h2>使用统计</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <message-outlined />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.chat_count }}</div>
          <div class="stat-label">对话次数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <calendar-outlined />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.plan_count }}</div>
          <div class="stat-label">行程计划</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">
          <star-outlined />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.star_count }}</div>
          <div class="stat-label">收藏景点</div>
        </div>
      </div>
    </div>
    
    <div class="join-time">
      <clock-circle-outlined />
      <span>加入时间：{{ formatDate(stats.created_at) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { MessageOutlined, CalendarOutlined, StarOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';

const route = useRoute();
const stats = ref({
  chat_count: 0,
  plan_count: 0,
  star_count: 0,
  created_at: ''
});

onMounted(() => {
  const statsData = route.query.stats;
  if (statsData) {
    stats.value = JSON.parse(statsData);
  }
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.statistics-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 32px;
  color: #333;
  font-size: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: #f0f7ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon :deep(.anticon) {
  font-size: 24px;
  color: #1890ff;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.join-time {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
}

.join-time :deep(.anticon) {
  font-size: 18px;
  color: #1890ff;
}
</style> 