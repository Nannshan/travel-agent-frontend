<template>
  <div class="trip-plan">
    <div v-if="loading" class="loading-state">
      <a-spin size="large" />
      <p>加载行程计划中...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <a-alert
        :message="error"
        type="error"
        show-icon
      />
    </div>

    <div v-else-if="planData?.travel_plan?.length" class="trip-content">
      <div class="trip-header">
        <div class="header-actions">
          <button class="back-btn">
            <i class="fas fa-arrow-left"></i>
          </button>
          <h1>AI 旅行规划师</h1>
        </div>
        <div class="header-right">
          <button class="share-btn">
            <i class="fas fa-share-alt"></i>
          </button>
          <button class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="trip-title">
        <h2>{{ mainTitle }}</h2>
        <p class="last-updated">最后更新: {{ formatDate(new Date()) }}</p>
      </div>

      <div class="days-nav">
        <div
          v-for="(day, index) in planData.travel_plan"
          :key="index"
          :class="['day-tab', { active: currentDay === index }]"
          @click="currentDay = index"
        >
          <div class="day-number">天 {{ index + 1 }}</div>
          <div class="day-date">{{ formatShortDate(day.date) }}</div>
        </div>
      </div>

      <div class="trip-content" v-if="currentDayPlan">
        <div class="day-content">
          <div class="day-header">
            <h3 class="day-title">{{ currentDayPlan.subject }}</h3>
            <div class="day-info">
              <span class="weather">{{ currentDayPlan.weather_condition }}</span>
              <span class="preference">偏好：{{ currentDayPlan.user_preference }}</span>
            </div>
          </div>
          
          <div class="time-section">
            <h4>上午</h4>
            <div class="activity-card">
              <div class="activity-header">
                <h5>{{ currentDayPlan.itinerary.morning.attraction }}</h5>
              </div>
              <p class="activity-desc">{{ currentDayPlan.itinerary.morning.arrangement }}</p>
              <div class="activity-footer">
                <span class="tag">推荐理由</span>
                <p>{{ currentDayPlan.itinerary.morning.recommendation_reason }}</p>
              </div>
            </div>
          </div>

          <div class="time-section">
            <h4>下午</h4>
            <div class="activity-card">
              <div class="activity-header">
                <h5>{{ currentDayPlan.itinerary.afternoon.attraction }}</h5>
              </div>
              <p class="activity-desc">{{ currentDayPlan.itinerary.afternoon.arrangement }}</p>
              <div class="activity-footer">
                <span class="tag">推荐理由</span>
                <p>{{ currentDayPlan.itinerary.afternoon.recommendation_reason }}</p>
              </div>
            </div>
          </div>

          <div class="day-summary">
            <div class="summary-card">
              <h4>今日总结</h4>
              <p>{{ currentDayPlan.summary }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getPlanDetail } from '@/api/plan.js';

const props = defineProps({
  planId: {
    type: [String, Number],
    required: true
  }
});

const planData = ref(null);
const currentDay = ref(0);
const loading = ref(true);
const error = ref(null);

const currentDayPlan = computed(() => {
  return planData.value?.travel_plan?.[currentDay.value];
});

const mainTitle = computed(() => {
  return planData.value?.travel_plan?.[0]?.subject || '旅行计划';
});

// 获取计划详情
const fetchPlanData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await getPlanDetail(props.planId);
    planData.value = response.data;
  } catch (err) {
    console.error('获取计划详情失败:', err);
    error.value = '获取计划详情失败，请重试';
  } finally {
    loading.value = false;
  }
};

// 监听planId变化
watch(() => props.planId, () => {
  if (props.planId) {
    fetchPlanData();
  }
}, { immediate: true });

const formatDate = (date) => {
  return date.getFullYear() + ' ' + 
         String(date.getMonth() + 1).padStart(2, '0') + ' ' +
         String(date.getDate()).padStart(2, '0');
};

const formatShortDate = (dateStr) => {
  const date = new Date(dateStr);
  return (date.getMonth() + 1) + '/' + date.getDate();
};
</script>

<style scoped>
.trip-plan {
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.trip-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-actions h1 {
  font-size: 20px;
  margin: 0;
  font-weight: 600;
}

.header-right {
  display: flex;
  gap: 12px;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #f5f5f5;
}

.trip-title {
  padding: 24px;
  background: #f8f9fa;
}

.trip-title h2 {
  margin: 0;
  font-size: 28px;
  color: #1a1a1a;
}

.last-updated {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.days-nav {
  display: flex;
  padding: 16px 24px;
  gap: 12px;
  border-bottom: 1px solid #eaeaea;
  background: #ffffff;
  overflow-x: auto;
}

.day-tab {
  padding: 12px 24px;
  cursor: pointer;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  min-width: 100px;
  text-align: center;
  transition: all 0.3s;
}

.day-tab.active {
  background: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

.day-tab.active .day-date {
  color: rgba(255, 255, 255, 0.8);
}

.day-number {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.day-date {
  font-size: 14px;
  color: #666;
}

.trip-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.day-header {
  margin-bottom: 24px;
}

.day-title {
  margin: 0 0 12px;
  font-size: 24px;
  color: #1a1a1a;
}

.day-info {
  display: flex;
  gap: 16px;
  color: #666;
}

.time-section {
  margin-bottom: 32px;
}

.time-section h4 {
  margin: 0 0 16px;
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

.activity-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.activity-header {
  margin-bottom: 16px;
}

.activity-header h5 {
  margin: 0;
  font-size: 18px;
  color: #1a1a1a;
}

.activity-desc {
  margin: 0 0 16px;
  color: #333;
  line-height: 1.6;
}

.activity-footer {
  border-top: 1px solid #eaeaea;
  padding-top: 16px;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  background: #f0f7ff;
  color: #1a73e8;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
}

.summary-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-top: 32px;
}

.summary-card h4 {
  margin: 0 0 12px;
  color: #1a1a1a;
}

.summary-card p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.weather, .preference {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
}

.loading-state p {
  margin-top: 16px;
  color: #666;
}

.error-state {
  max-width: 400px;
  margin: 0 auto;
}
</style> 