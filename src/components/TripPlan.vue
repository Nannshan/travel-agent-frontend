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

      <div class="trip-title">
        <h2>{{ mainTitle }}</h2>
        <p class="last-updated">最后更新 - {{ planData?.updated_at ? formatDate(new Date(planData.updated_at)) : '暂无更新时间' }}</p>
      </div>
      <div class="city-info" v-if="cityInfo">
        <div class="city-image-container">
          <img :src="cityInfo.imgurl" :alt="cityInfo.name" class="city-image" />
          <div class="city-image-overlay">
            <div class="city-name">{{ cityInfo.name }}</div>
            <div class="city-coordinates" v-if="cityCenter">
              <div class="coordinate-item">
                {{ formatCoordinate(cityCenter.longitude, 'longitude') }}
              </div>
              <div class="coordinate-item">
                {{ formatCoordinate(cityCenter.latitude, 'latitude') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="days-nav">
        <div
          v-for="(day, index) in planData.travel_plan"
          :key="index"
          :class="['day-tab', { active: currentDay === index }]"
          @click="currentDay = index"
        >
          <div class="day-number">第{{ numberToChinese(index + 1) }}天</div>
          <div class="day-date">{{ formatShortDate(day.date) }}</div>
        </div>
      </div>

      <div class="trip-content" v-if="currentDayPlan">
        <div class="activities-container">
          <div class="day-info">
            <h3 class="day-title">{{ currentDayPlan.subject }}</h3>
            <span class="weather">{{ currentDayPlan.weather_condition }}</span>
          </div>

          <div class="time-section">
            <h4>上午</h4>
            <div class="activity-card">
              <div class="activity-header">
                <h5 
                  class="attraction-link"
                  @click="handleSceneClick(currentDayPlan.itinerary.morning.attraction)"
                >
                  {{ currentDayPlan.itinerary.morning.attraction }}
                </h5>
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
                <h5 
                  class="attraction-link"
                  @click="handleSceneClick(currentDayPlan.itinerary.afternoon.attraction)"
                >
                  {{ currentDayPlan.itinerary.afternoon.attraction }}
                </h5>
              </div>
              <p class="activity-desc">{{ currentDayPlan.itinerary.afternoon.arrangement }}</p>
              <div class="activity-footer">
                <span class="tag">推荐理由</span>
                <p>{{ currentDayPlan.itinerary.afternoon.recommendation_reason }}</p>
              </div>
            </div>
          </div>

          <div class="summary-section">
            <h4>今日总结</h4>
            <p>{{ currentDayPlan.summary }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getPlanDetail } from '@/api/plan.js';
import { searchAccurateScene } from '@/api/scene.js';
import { getCityDetail, getCityCenterDetail } from '@/api/city.js';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';

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
const sceneUrlMap = ref({});
const cityInfo = ref(null);
const cityCenter = ref(null);

// 加载CSV数据
const loadSceneData = async () => {
  try {
    const response = await fetch('/docs/scene.csv');
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // 跳过标题行
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // 解析CSV行
      const [name, url] = line.split(',').map(item => item.replace(/"/g, '').trim());
      if (name && url) {
        sceneUrlMap.value[name] = url;
      }
    }
  } catch (err) {
    console.error('加载景点数据失败:', err);
  }
};

// 在组件挂载时加载CSV数据
onMounted(() => {
  loadSceneData();
});

const currentDayPlan = computed(() => {
  return planData.value?.travel_plan?.[currentDay.value];
});

const mainTitle = computed(() => {
  if (!planData.value?.travel_plan?.length) return '旅行计划';
  const days = planData.value.travel_plan.length;
  const city = planData.value.travel_plan[0].city || '未知城市';
  return `${city}${numberToChinese(days)}日游`;
});

const router = useRouter();

// 格式化经纬度
const formatCoordinate = (value, type) => {
  if (!value) return '';
  const degrees = Math.floor(Math.abs(value));
  const minutes = Math.round((Math.abs(value) - degrees) * 60);
  
  return `${type === 'longitude' ? '东经' : '北纬'} ${degrees}°${minutes}'`;
};

// 获取城市信息
const fetchCityInfo = async (cityName) => {
  try {
    const [cityDetailRes, cityCenterRes] = await Promise.all([
      getCityDetail(cityName),
      getCityCenterDetail(cityName)
    ]);
    
    if (cityDetailRes?.data) {
      cityInfo.value = cityDetailRes.data;
    }
    
    if (cityCenterRes?.data) {
      cityCenter.value = cityCenterRes.data;
    }
  } catch (err) {
    console.error('获取城市信息失败:', err);
  }
};

// 修改 fetchPlanData 函数
const fetchPlanData = async () => {
  try {
    loading.value = true;
    error.value = null;
    console.log('开始获取计划数据，planId:', props.planId);
    
    const response = await getPlanDetail(props.planId);
    console.log('获取到的原始数据:', response);
    
    if (!response || !response.data) {
      throw new Error('未获取到计划数据');
    }

    if (typeof response.data.travel_plan === 'string') {
      try {
        response.data.travel_plan = JSON.parse(response.data.travel_plan);
      } catch (e) {
        console.error('解析travel_plan失败:', e);
        throw new Error('计划数据格式不正确');
      }
    }
    
    planData.value = response.data;
    
    // 获取城市信息
    if (planData.value?.travel_plan?.[0]?.city) {
      await fetchCityInfo(planData.value.travel_plan[0].city);
    }
    
    console.log('处理后的planData:', planData.value);
    
  } catch (err) {
    console.error('获取计划详情失败:', err);
    error.value = err.message || '获取计划详情失败，请重试';
  } finally {
    loading.value = false;
  }
};

// 监听planId变化
watch(() => props.planId, (newId) => {
  console.log('planId changed:', newId);
  if (newId) {
    fetchPlanData();
  } else {
    planData.value = null;
    error.value = null;
  }
}, { immediate: true });

const formatDate = (date) => {
  return date.getFullYear() + ' ' + 
         String(date.getMonth() + 1).padStart(2, '0') + ' ' +
         String(date.getDate()).padStart(2, '0');
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const handleSceneClick = async (sceneName) => {
  try {
    // 首先尝试使用API搜索
    const response = await searchAccurateScene(sceneName);
    if (response.data && response.data.id) {
      router.push({
        name: 'SceneDetail',
        params: { id: response.data.id }
      });
    } else {
      // 如果API搜索失败，尝试从本地数据中查找
      const sceneUrl = sceneUrlMap.value[sceneName];
      if (sceneUrl) {
        // 如果找到URL，直接跳转到携程页面
        window.open(sceneUrl, '_blank');
      } else {
        message.warning('未找到对应景点信息');
      }
    }
  } catch (error) {
    console.error('搜索景点失败:', error);
    // API调用失败时，尝试从本地数据中查找
    const sceneUrl = sceneUrlMap.value[sceneName];
    if (sceneUrl) {
      window.open(sceneUrl, '_blank');
    } else {
      message.error('获取景点信息失败');
    }
  }
};

// 数字转中文
const numberToChinese = (num) => {
  const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num <= 10) return chineseNums[num];
  if (num < 20) return '十' + (num % 10 === 0 ? '' : chineseNums[num % 10]);
  return chineseNums[Math.floor(num / 10)] + '十' + (num % 10 === 0 ? '' : chineseNums[num % 10]);
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
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-actions h1 {
  font-size: 18px;
  margin: 0;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  gap: 8px;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.2s;
  color: #666;
}

button:hover {
  background-color: #f5f5f5;
  color: #1a73e8;
}

.trip-title {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eaeaea;
}

.trip-title h2 {
  margin: 0;
  font-size: 24px;
  color: #1a1a1a;
  font-weight: 600;
}

.last-updated {
  margin: 4px 0 0;
  color: #666;
  font-size: 13px;
}

.days-nav {
  display: flex;
  padding: 20px;
  gap: 12px;
  overflow-x: auto;
  background: #fff;
}

.day-tab {
  min-width: 120px;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  background: #fff;
}

.day-tab.active {
  border: 2px solid #666;
  background: #fff;
  color: inherit;
}

.day-number {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.day-date {
  font-size: 14px;
  color: #666;
}

.day-tab.active .day-date {
  color: #666;
}

.trip-content {
  flex: 1;
  overflow-y: auto;
}

.activities-container {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #eaeaea;
  margin: 20px;
}

.day-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaeaea;
}

.day-title {
  margin: 0;
  font-size: 22px;
  color: #1a1a1a;
  font-weight: 600;
}

.weather {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  background: #f5f5f5;
  padding: 4px 12px;
  border-radius: 4px;
}

.time-section {
  margin-bottom: 16px;
}

.time-section:last-child {
  margin-bottom: 0;
}

.time-section h4 {
  margin: 0 0 12px;
  color: #1a73e8;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.activity-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.activity-header h5 {
  margin: 0;
  font-size: 20px;
  color: #1a1a1a;
  font-weight: 600;
}

.activity-desc {
  margin: 12px 0;
  color: #333;
  line-height: 1.6;
  font-size: 16px;
}

.activity-footer {
  border-top: 1px solid #eaeaea;
  padding-top: 12px;
  font-size: 14px;
}

.activity-footer p {
  margin: 8px 0 0;
  color: #666;
  line-height: 1.5;
  font-size: 15px;
}

.tag {
  display: inline-block;
  padding: 2px 8px;
  background: #f0f7ff;
  color: #1a73e8;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 6px;
  font-weight: 500;
}

.summary-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
}

.summary-section h4 {
  margin: 0 0 12px;
  color: #1a1a1a;
  font-size: 16px;
  font-weight: 600;
}

.summary-section p {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 15px;
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
  margin-top: 12px;
  color: #666;
  font-size: 14px;
}

.error-state {
  max-width: 400px;
  margin: 0 auto;
}

.attraction-link {
  cursor: pointer;
  margin: 0;
  font-size: 20px;
  color: #1a73e8;
  font-weight: 600;
  position: relative;
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  background: #e3f2fd;
  transition: all 0.3s ease;
}

.attraction-link::before {
  content: '📍';
  font-size: 18px;
  margin-right: 6px;
  vertical-align: middle;
  position: relative;
  top: -2px;
}

.attraction-link::after {
  content: '查看详情';
  font-size: 14px;
  margin-left: 8px;
  color: #1a73e8;
  opacity: 1;
  font-weight: 500;
}

.attraction-link:hover {
  background: #1a73e8;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(26,115,232,0.2);
}

.attraction-link:hover::after {
  color: white;
}

/* 修改城市信息样式 */
.city-info {
  position: relative;
  width: 100%;
  height: 360px;
  overflow: hidden;
  margin-bottom: 20px;
}

.city-image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.city-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.city-image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 16px;
}

.city-name {
  color: white;
  font-size: 42px;
  font-weight: 600;
  text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  letter-spacing: 1px;
}

.city-coordinates {
  display: flex;
  gap: 16px;
  margin-top: 0;
}

.coordinate-item {
  color: white;
  font-size: 18px;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
}
</style> 