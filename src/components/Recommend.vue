<template>
  <div class="recommend-section">
    <h3 class="recommend-title">旅行推荐</h3>
    <div v-if="loading" class="loading-container">
      <a-spin size="large" />
      <p>精彩内容加载中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>加载失败，正在重试...</p>
    </div>
    <div v-else class="recommend-container">
      <div 
        class="recommend-item" 
        v-for="item in recommendations" 
        :key="item.id"
        @click="handleItemClick(item.id)"
      >
        <div class="image-wrapper">
          <img :src="item.imgurl.split(';')[0]" alt="item.name" class="recommend-image" />
        </div>
        <div class="item-info">
          <h4>{{ item.name }}</h4>
          <p class="city-text">{{ item.city }}</p>
          <p class="feature-text">{{ Array.isArray(item.features) ? item.features[0] : item.features }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSceneDetail } from '@/api/scene.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const recommendations = ref([]);
const loading = ref(true);
const error = ref(null);

const cleanFeatureText = (feature) => {
  if (!feature) return '';
  return feature.replace(/[\[\]"]/g, '').trim();
};

const handleItemClick = (id) => {
  router.push(`/scene-detail/${id}`);
};

// 生成1-6210之间的随机ID
const getRandomIds = (count) => {
  const ids = new Set();
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * 6210) + 1);
  }
  return Array.from(ids);
};

const fetchRecommendations = async () => {
  try {
    loading.value = true;
    // 随机选择6个ID
    const selectedIds = getRandomIds(6);
    
    // 并行获取所有选中ID的详情
    const detailPromises = selectedIds.map(id => getSceneDetail(id));
    const results = await Promise.all(detailPromises);
    
    // 过滤掉无效数据并确保有足够的数据
    const validResults = results.filter(res => res.data);
    
    if (validResults.length === 0) {
      throw new Error('没有获取到有效的推荐数据');
    }
    
    recommendations.value = validResults
      .map(res => ({
        ...res.data,
        features: Array.isArray(res.data.features) 
          ? res.data.features.map(cleanFeatureText)
          : cleanFeatureText(res.data.features)
      }));
  } catch (error) {
    console.error('获取景点列表失败:', error);
    // 如果失败，尝试重新获取
    setTimeout(() => {
      fetchRecommendations();
    }, 3000);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRecommendations();
});
</script>

<style scoped>
.recommend-section {
  padding: 40px 0;
  background: linear-gradient(to bottom, #fff, #f8f9fa);
}

.recommend-title {
  font-size: 32px;
  font-weight: 800;
  margin: 0 0 40px 0;
  color: #2c3e50;
  text-align: center;
  letter-spacing: 1px;
  position: relative;
}

.recommend-title::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #3498db;
  border-radius: 2px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #7f8c8d;
}

.loading-container p {
  margin-top: 20px;
  font-size: 15px;
  letter-spacing: 0.5px;
}

.recommend-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.recommend-item {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: white;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.recommend-item:hover {
  transform: translateY(-12px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.recommend-item:hover .recommend-image {
  transform: scale(1.1);
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/10;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}

.recommend-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.item-info {
  padding: 20px;
  background: white;
  border-radius: 0 0 20px 20px;
}

.item-info h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.city-text {
  font-size: 14px;
  margin: 0 0 6px 0;
  color: #666;
  font-weight: 500;
}

.feature-text {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .recommend-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .recommend-container {
    grid-template-columns: 1fr;
  }
  
  .recommend-title {
    font-size: 28px;
  }
}
</style>
  