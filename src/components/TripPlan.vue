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

      <!-- 景点总览部分 -->
      <div class="overview-section">
        <div class="overview-header" @click="showOverview = !showOverview">
          <h3>行程总览</h3>
          <DownOutlined :class="['collapse-icon', { 'is-collapsed': !showOverview }]" />
        </div>
        <div class="overview-content" v-show="showOverview">
          <div class="timeline-map-container">
            <div class="timeline-container">
              <div class="timeline">
                <div v-for="(day, dayIndex) in planData.travel_plan" 
                     :key="dayIndex" 
                     class="timeline-item"
                     @mouseenter="hoveredDayIndex = dayIndex"
                     @mouseleave="hoveredDayIndex = -1">
                  <div class="timeline-date">
                    <div class="day-number">第{{ numberToChinese(dayIndex + 1) }}天</div>
                    <div class="date">{{ formatShortDate(day.date) }}</div>
                  </div>
                  <div class="timeline-node"></div>
                  <div class="timeline-content">
                    <div class="timeline-attractions">
                      <div v-if="day.itinerary.morning.attraction" class="timeline-attraction">
                        <span class="time-label">上午</span>
                        <span class="attraction" @click="handleSceneClick(day.itinerary.morning.attraction)">
                          {{ day.itinerary.morning.attraction }}
                        </span>
                      </div>
                      <div v-if="day.itinerary.afternoon.attraction" class="timeline-attraction">
                        <span class="time-label">下午</span>
                        <span class="attraction" @click="handleSceneClick(day.itinerary.afternoon.attraction)">
                          {{ day.itinerary.afternoon.attraction }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="overview-map" v-if="planData && cityCenter">
              <Map 
                ref="mapRef"
                :plan-data="planData"
                :city-center="cityCenter"
                map-id="overview-map-container"
                :highlight-day-index="hoveredDayIndex"
                @updateFoodList="handleFoodListUpdate"
              />
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
            <div class="weather-card">
              <div class="weather-icon">
                <span class="weather-emoji">{{ getWeatherEmoji(currentDayPlan.weather_condition) }}</span>
              </div>
              <div class="weather-info">
                <div class="weather-condition">{{ currentDayPlan.weather_condition }}</div>
                <div class="weather-temp" v-if="currentDayPlan.temperature">
                  {{ currentDayPlan.temperature }}°C
                </div>
              </div>
            </div>
          </div>

          <div class="day-schedule">
            <div class="time-section morning-section" v-if="currentDayPlan.itinerary.morning.attraction">
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
                  <div class="preparation-section" v-if="currentDayPlan.itinerary.morning.preparation">
                    <span class="preparation-tag">准备事项</span>
                    <p>{{ currentDayPlan.itinerary.morning.preparation }}</p>
                  </div>
                  <div class="travel-guide-section" v-if="currentDayPlan.itinerary.morning.travel_guide">
                    <span class="travel-guide-tag">旅行指南</span>
                    <p>{{ currentDayPlan.itinerary.morning.travel_guide }}</p>
                  </div>
                  <div class="nearby-food">
                    <span class="food-tag">附近美食</span>
                    <div class="food-list" v-if="morningFoodList && morningFoodList.length > 0">
                      <div v-for="food in morningFoodList" :key="food.id" class="food-item">
                        <div class="food-name">{{ food.name }}</div>
                        <div class="food-details">
                          <span class="food-distance">📍 {{ food.distance }}米</span>
                          <span class="food-address" v-if="food.address">{{ food.address }}</span>
                          <span class="food-tel" v-if="food.tel">📞 {{ food.tel }}</span>
                        </div>
                      </div>
                    </div>
                    <p v-else class="no-food">暂无附近美食信息</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="time-section afternoon-section" v-if="currentDayPlan.itinerary.afternoon.attraction">
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
                  <div class="preparation-section" v-if="currentDayPlan.itinerary.afternoon.preparation">
                    <span class="preparation-tag">准备事项</span>
                    <p>{{ currentDayPlan.itinerary.afternoon.preparation }}</p>
                  </div>
                  <div class="travel-guide-section" v-if="currentDayPlan.itinerary.afternoon.travel_guide">
                    <span class="travel-guide-tag">旅行指南</span>
                    <p>{{ currentDayPlan.itinerary.afternoon.travel_guide }}</p>
                  </div>
                  <div class="nearby-food">
                    <span class="food-tag">附近美食</span>
                    <div class="food-list" v-if="afternoonFoodList && afternoonFoodList.length > 0">
                      <div v-for="food in afternoonFoodList" :key="food.id" class="food-item">
                        <div class="food-name">{{ food.name }}</div>
                        <div class="food-details">
                          <span class="food-distance">📍 {{ food.distance }}米</span>
                          <span class="food-address" v-if="food.address">{{ food.address }}</span>
                          <span class="food-tel" v-if="food.tel">📞 {{ food.tel }}</span>
                        </div>
                      </div>
                    </div>
                    <p v-else class="no-food">暂无附近美食信息</p>
                  </div>
                </div>
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
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { getPlanDetail } from '@/api/plan.js';
import { searchAccurateScene } from '@/api/scene.js';
import { getCityDetail, getCityCenterDetail } from '@/api/city.js';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { DownOutlined } from '@ant-design/icons-vue';
import Map from './Map.vue';

const props = defineProps({
  planId: {
    type: [String, Number],
    required: true
  }
});

const route = useRoute();
const router = useRouter();

const planData = ref(null);
const currentDay = ref(0);
const loading = ref(true);
const error = ref(null);
const sceneUrlMap = ref({});
const cityInfo = ref(null);
const cityCenter = ref(null);

// 添加控制显示/隐藏的状态
const showOverview = ref(true);

// 添加新的响应式变量
const hoveredDayIndex = ref(-1);
const morningFoodList = ref([]);
const afternoonFoodList = ref([]);

const mapRef = ref(null);

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

// 监听路由参数变化
watch(() => route.params.planId, (newId) => {
  console.log('路由参数变化，新的planId:', newId);
  if (newId) {
    // 重置状态
    planData.value = null;
    cityInfo.value = null;
    cityCenter.value = null;
    morningFoodList.value = [];
    afternoonFoodList.value = [];
    currentDay.value = 0;
    
    // 重新获取数据
    fetchPlanData();
  }
}, { immediate: true });

// 修改原有的 planId watch
watch(() => props.planId, (newId) => {
  console.log('props.planId changed:', newId);
  if (newId) {
    // 重置状态
    planData.value = null;
    cityInfo.value = null;
    cityCenter.value = null;
    morningFoodList.value = [];
    afternoonFoodList.value = [];
    currentDay.value = 0;
    
    // 重新获取数据
    fetchPlanData();
  } else {
    planData.value = null;
    error.value = null;
  }
}, { immediate: true });

// 添加对 planData 的监听
watch(() => planData.value, (newData) => {
  console.log('planData changed:', newData);
  if (newData?.travel_plan?.[0]?.city) {
    fetchCityInfo(newData.travel_plan[0].city);
  }
}, { deep: true });

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

// 添加天气表情映射函数
const getWeatherEmoji = (weather) => {
  if (!weather) return '🌤️';
  const weatherMap = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '小雨': '🌧️',
    '中雨': '🌧️',
    '大雨': '⛈️',
    '雷阵雨': '⛈️',
    '阵雨': '🌦️',
    '雪': '🌨️',
    '雾': '🌫️',
    '霾': '🌫️',
    '沙尘': '🌪️'
  };
  
  for (const [key, value] of Object.entries(weatherMap)) {
    if (weather.includes(key)) return value;
  }
  return '🌤️';
};

// 监听当前日期变化，更新美食列表
watch([currentDay, planData], async ([newDay, newPlanData]) => {
  console.log('【TripPlan组件】currentDay 或 planData 发生变化:', {
    当前日期: newDay + 1,
    计划数据: newPlanData ? '已加载' : '未加载'
  });
  
  // 检查 planData 是否已加载
  if (!newPlanData?.travel_plan) {
    console.warn('【TripPlan组件】planData 尚未加载完成');
    return;
  }
  
  if (!newPlanData?.travel_plan?.[newDay]) {
    console.warn('【TripPlan组件】没有找到对应日期的行程数据');
    return;
  }
  
  const dayPlan = newPlanData.travel_plan[newDay];
  console.log('【TripPlan组件】开始处理第', newDay + 1, '天的行程:', dayPlan);
  
  // 重置美食列表
  console.log('【TripPlan组件】重置美食列表');
  morningFoodList.value = [];
  afternoonFoodList.value = [];
  
  // 触发地图组件更新美食列表
  if (mapRef.value) {
    // 延迟一帧，确保视图更新
    await nextTick();
    
    // 触发地图组件的缓存更新事件
    if (dayPlan.itinerary.morning.attraction) {
      mapRef.value.updateFoodListFromCache(dayPlan.itinerary.morning.attraction, '上午');
    }
    
    if (dayPlan.itinerary.afternoon.attraction) {
      mapRef.value.updateFoodListFromCache(dayPlan.itinerary.afternoon.attraction, '下午');
    }
  } else {
    console.warn('【TripPlan组件】地图组件未加载');
  }
});

// 处理美食列表更新
const handleFoodListUpdate = ({ timeSlot, foodList }) => {
  console.log(`【TripPlan组件】接收到美食列表更新:`, {
    时段: timeSlot,
    数量: foodList.length,
    列表: foodList
  });
  
  if (timeSlot === '上午') {
    console.log('【TripPlan组件】更新上午美食列表:', foodList);
    morningFoodList.value = JSON.parse(JSON.stringify(foodList));
    console.log('【TripPlan组件】上午美食列表已更新，长度:', morningFoodList.value.length, '内容:', morningFoodList.value);
  } else if (timeSlot === '下午') {
    console.log('【TripPlan组件】更新下午美食列表:', foodList);
    afternoonFoodList.value = JSON.parse(JSON.stringify(foodList));
    console.log('【TripPlan组件】下午美食列表已更新，长度:', afternoonFoodList.value.length, '内容:', afternoonFoodList.value);
  }
};

// 监听美食列表变化，确保视图更新
watch(morningFoodList, (newVal) => {
  console.log('【TripPlan组件】morningFoodList 发生变化:', newVal);
}, { deep: true });

watch(afternoonFoodList, (newVal) => {
  console.log('【TripPlan组件】afternoonFoodList 发生变化:', newVal);
}, { deep: true });

// 添加对 planData 的监听，当数据首次加载时自动搜索美食
watch(() => planData.value?.travel_plan, async (newPlan) => {
  if (newPlan?.length > 0) {
    // 触发 currentDay 的 watch 来执行美食搜索
    currentDay.value = currentDay.value;
  }
}, { immediate: true });

// 组件卸载时清理资源
onUnmounted(() => {
  if (mapRef.value) {
    mapRef.value.destroy();
  }
});
</script>

<style scoped>
.trip-plan {
  height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.trip-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.header-actions {
  display: flex;
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
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 8px;
  margin-bottom: 20px;
}

.day-schedule {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.time-section {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #eaeaea;
  min-width: 0; /* 防止flex子项溢出 */
}

.morning-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.afternoon-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.time-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #1a73e8;
}

.summary-section {
  margin-top: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
  border-radius: 12px;
  border: 1px solid #eaeaea;
  transition: all 0.3s;
}

.day-title {
  margin: 0;
  font-size: 22px;
  color: #1a1a1a;
  font-weight: 600;
}

.weather-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #6B8DD6 0%, #8E37D7 100%);
  padding: 12px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  color: white;
  transition: transform 0.3s ease;
}

.weather-card:hover {
  transform: translateY(-2px);
}

.weather-icon {
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.weather-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.weather-condition {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.9;
}

.weather-temp {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.activity-card {
  background: transparent;
  padding: 0;
  border: none;
  position: relative;
}

.activity-header {
  margin-bottom: 12px;
}

.activity-header h5 {
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
  transition: all 0.3s;
}

.activity-desc {
  margin: 12px 0;
  color: #666;
  line-height: 1.6;
  font-size: 15px;
}

.activity-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
}

.activity-footer p {
  margin: 8px 0 0;
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #f0f7ff;
  color: #1a73e8;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.tag::before {
  content: '💡';
  margin-right: 6px;
  font-size: 12px;
}

.attraction-link {
  cursor: pointer;
  margin: 0;
  font-size: 20px;
  color: #333;
  font-weight: 600;
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  text-decoration: none;
  background: transparent;
}

.attraction-link::before {
  content: '📍';
  font-size: 16px;
  margin-right: 8px;
  opacity: 0.8;
  transition: all 0.3s;
}

.attraction-link::after {
  content: '查看详情 →';
  position: absolute;
  right: 12px;
  font-size: 14px;
  color: #1a73e8;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
  font-weight: 500;
}

.attraction-link:hover {
  color: #1a73e8;
  padding-right: 100px;
  background: #f0f7ff;
}

.attraction-link:hover::before {
  opacity: 1;
  transform: scale(1.1);
}

.attraction-link:hover::after {
  opacity: 1;
  transform: translateX(0);
}

.summary-section h4 {
  margin: 0 0 12px;
  color: #333;
  font-size: 20px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 1px solid #eaeaea;
}

.summary-section p {
  margin: 0;
  color: #333;
  line-height: 1.8;
  font-size: 16px;
  font-weight: 500;
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

.map-container {
  height: 400px;
  margin: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.map {
  width: 100%;
  height: 100%;
}

:deep(.info-window) {
  padding: 8px;
}

:deep(.info-window h3) {
  margin: 0 0 4px;
  font-size: 16px;
  color: #333;
}

:deep(.info-window p) {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.overview-section {
  margin: 20px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eaeaea;
  overflow: hidden;
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
  cursor: pointer;
  transition: background-color 0.3s;
}

.overview-header:hover {
  background-color: #f5f5f5;
}

.overview-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.overview-content {
  padding: 20px;
}

.timeline-map-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 15px;
}

.timeline-container {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.timeline {
  position: relative;
  display: flex;
  padding: 0;
  margin: 0 auto;
  max-width: 1200px;
  gap: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 65px;
  height: 1px;
  background: #eaeaea;
  z-index: 0;
}

.timeline-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.timeline-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.day-number {
  font-size: 16px;
  font-weight: 500;
  color: #1a73e8;
  margin-bottom: 2px;
}

.date {
  font-size: 13px;
  color: #666;
}

.timeline-node {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1a73e8;
  border: 2px solid #fff;
  position: relative;
  z-index: 1;
  margin: 8px 0;
}

.timeline-content {
  padding-top: 20px;
  width: 100%;
}

.timeline-attractions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.timeline-attraction {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #fff;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.timeline-attraction:hover {
  background: #f0f7ff;
}

.time-label {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #fff;
  background: #1a73e8;
  white-space: nowrap;
}

.attraction {
  color: #333;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 14px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}

.attraction:hover {
  color: #1a73e8;
}

.overview-map {
  width: 100%;
  height: 480px;
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 768px) {
  .timeline {
    gap: 20px;
  }
  
  .timeline-item {
    min-width: 160px;
  }
}

.collapse-icon {
  font-size: 16px;
  color: #666;
  transition: transform 0.3s;
}

.collapse-icon.is-collapsed {
  transform: rotate(-180deg);
}

.nearby-food {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
}

.food-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #fff3e0;
  color: #ff9800;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.food-tag::before {
  content: '🍽️';
  margin-right: 6px;
  font-size: 12px;
}

.food-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.food-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  transition: background-color 0.2s ease;
}

.food-item:hover {
  background-color: #f9f9f9;
}

.food-name {
  font-size: 15px;
  color: #333;
  font-weight: 600;
  margin-bottom: 5px;
}

.food-details {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin-top: 3px;
}

.food-distance {
  font-size: 13px;
  color: #666;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.food-address {
  font-size: 13px;
  color: #888;
  flex-grow: 1;
  flex-shrink: 1;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

.food-tel {
  font-size: 13px;
  color: #888;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: auto;
}

.no-food {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
}

.preparation-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
}

.preparation-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.preparation-tag::before {
  content: '📝';
  margin-right: 6px;
  font-size: 12px;
}

.travel-guide-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
}

.travel-guide-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #fff3e0;
  color: #ff9800;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.travel-guide-tag::before {
  content: '🗺️';
  margin-right: 6px;
  font-size: 12px;
}

.preparation-section p,
.travel-guide-section p {
  margin: 8px 0 0;
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}
</style> 