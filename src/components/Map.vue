<template>
  <div class="map-container">
    <div :id="mapId" class="map"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { searchAccurateAttraction } from '@/api/attraction.js';

const props = defineProps({
  planData: {
    type: Object,
    required: true
  },
  cityCenter: {
    type: Object,
    default: null
  },
  mapId: {
    type: String,
    default: 'map-container'
  },
  highlightDayIndex: {
    type: Number,
    default: -1
  }
});

const emit = defineEmits(['updateFoodList']);

const map = ref(null);
const markers = ref([]);
const highlightedMarkers = ref([]);

// 添加缓存存储
const sceneLocationCache = ref(new Map());
const sceneFoodCache = ref(new Map());

// 添加信号量控制类
class Semaphore {
  constructor(max) {
    this.max = max;
    this.count = 0;
    this.queue = [];
  }

  async acquire() {
    if (this.count < this.max) {
      this.count++;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.queue.push(resolve);
    });
  }

  release() {
    this.count--;
    if (this.queue.length > 0 && this.count < this.max) {
      this.count++;
      const next = this.queue.shift();
      next();
    }
  }
}

// 创建信号量实例，限制最大并发为3
const searchSemaphore = new Semaphore(3);

// 搜索附近美食
const searchNearbyFood = async (sceneName, timeSlot, location) => {
  console.log(`【Map组件】开始搜索景点 "${sceneName}" 附近的美食:`, {
    时段: timeSlot,
    位置: {
      经度: location?.longitude,
      纬度: location?.latitude
    }
  });

  // 生成缓存键
  const cacheKey = `${sceneName}_${timeSlot}`;

  // 检查缓存
  if (sceneFoodCache.value.has(cacheKey)) {
    console.log(`【Map组件】使用缓存的美食数据: ${cacheKey}`);
    const cachedFoodList = sceneFoodCache.value.get(cacheKey);
    emit('updateFoodList', { timeSlot, foodList: cachedFoodList });
    return cachedFoodList;
  }

  if (!location?.longitude || !location?.latitude) {
    console.warn(`【Map组件】景点 ${sceneName} 缺少位置信息，无法搜索附近美食`);
    emit('updateFoodList', { timeSlot, foodList: [] });
    return [];
  }

  // 获取信号量
  await searchSemaphore.acquire();
  console.log(`【Map组件】获得搜索许可，开始搜索 "${sceneName}" 附近美食`);

  return new Promise((resolve) => {
    console.log('【Map组件】创建 PlaceSearch 实例，搜索配置:', {
      城市: props.planData?.travel_plan?.[0]?.city || 'all',
      搜索范围: '1000米',
      兴趣点类型: '050000|050100|050200|050300'
    });

    window.AMap.plugin(['AMap.PlaceSearch'], () => {
      const placeSearch = new window.AMap.PlaceSearch({
        pageSize: 20,
        pageIndex: 1,
        city: props.planData?.travel_plan?.[0]?.city || 'all',
        type: '050000|050100|050200|050300',
        extensions: 'all'
      });
      
      console.log(`【Map组件】开始在坐标 [${location.longitude}, ${location.latitude}] 周围1000米范围内搜索美食...`);
      
      placeSearch.searchNearBy('', [location.longitude, location.latitude], 1000, (status, result) => {
        // 释放信号量
        searchSemaphore.release();
        console.log(`【Map组件】释放搜索许可，完成 "${sceneName}" 附近美食搜索`);

        if (status === 'complete' && result.info === 'OK' && result.poiList?.pois?.length > 0) {
          const allPois = result.poiList.pois;
          console.log('【Map组件】所有搜索结果:', allPois.map(p => p.name));
          
          // 排除咖啡店和奶茶店
          const filteredPois = allPois.filter(poi => {
            const lowerName = poi.name.toLowerCase();
            const lowerType = (poi.type || '').toLowerCase();
            const excludeKeywords = ['咖啡', 'coffee', '奶茶', '茶饮', '星巴克', '瑞幸', '饮品', '驿站'];
            return !excludeKeywords.some(keyword => 
              lowerName.includes(keyword) || lowerType.includes(keyword)
            );
          });
          
          const foodList = filteredPois
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 3)
            .map(poi => ({
              id: poi.id,
              name: poi.name,
              distance: Math.round(poi.distance),
              address: poi.address,
              tel: poi.tel ? poi.tel.split(';')[0].split(',')[0].trim() : '',
              type: poi.type
            }));
          
          // 保存到缓存
          sceneFoodCache.value.set(cacheKey, foodList);
          
          emit('updateFoodList', { timeSlot, foodList });
          resolve(foodList);
        } else {
          console.warn('【Map组件】未找到附近美食或搜索失败:', {
            景点: sceneName,
            状态: status,
            结果: result
          });
          emit('updateFoodList', { timeSlot, foodList: [] });
          resolve([]);
        }
      });
    });
  });
};

// 处理美食列表更新
const handleFoodListUpdate = ({ timeSlot, foodList }) => {
  console.log(`【Map组件】接收到美食列表更新:`, {
    时段: timeSlot,
    数量: foodList.length,
    列表: foodList
  });
};

// 添加从缓存更新美食列表的方法
const updateFoodListFromCache = (sceneName, timeSlot) => {
  const cacheKey = `${sceneName}_${timeSlot}`;
  console.log(`【Map组件】从缓存更新美食列表: ${cacheKey}`);
  
  if (sceneFoodCache.value.has(cacheKey)) {
    const foodList = sceneFoodCache.value.get(cacheKey);
    console.log(`【Map组件】找到缓存的美食数据: ${sceneName}, ${timeSlot}`, foodList);
    emit('updateFoodList', { timeSlot, foodList });
  } else {
    console.log(`【Map组件】缓存中没有找到美食数据: ${sceneName}, ${timeSlot}`);
    // 如果缓存中没有，尝试重新搜索
    if (sceneLocationCache.value.has(sceneName)) {
      const locationData = sceneLocationCache.value.get(sceneName);
      searchNearbyFood(sceneName, timeSlot, locationData);
    } else {
      console.warn(`【Map组件】缓存中没有找到景点位置信息: ${sceneName}`);
      emit('updateFoodList', { timeSlot, foodList: [] });
    }
  }
};

// 初始化地图
const initMap = () => {
  if (!window.AMap) {
    console.error('高德地图 JS API 未加载');
    return;
  }

  // 确保容器元素存在
  const container = document.getElementById(props.mapId);
  if (!container) {
    console.error(`地图容器 ${props.mapId} 不存在`);
    return;
  }

  try {
    // 创建地图实例
    map.value = new window.AMap.Map(props.mapId, {
      zoom: 14,
      center: props.cityCenter ? [props.cityCenter.longitude, props.cityCenter.latitude] : [116.397428, 39.90923],
      viewMode: '3D',
      pitch: 0,
      features: ['bg', 'road', 'building', 'point'],
      mapStyle: 'amap://styles/normal',
      showIndoorMap: true,
      showBuildingBlock: true,
      skyColor: '#1a73e8',
      buildingAnimation: true,
      zooms: [3, 20],  // 设置地图的缩放范围
      expandZoomRange: true
    });

    // 异步加载插件
    window.AMap.plugin([
      'AMap.Scale',
      'AMap.ToolBar',
      'AMap.PlaceSearch',
      'AMap.ControlBar'
    ], () => {
      if (!map.value) return;
      
      // 添加地图控件
      map.value.addControl(new window.AMap.Scale());
      map.value.addControl(new window.AMap.ToolBar({
        position: 'RB',
        ruler: true,
        locate: true
      }));
      
      // 添加3D控制控件
      map.value.addControl(new window.AMap.ControlBar({
        position: { top: '10px', right: '10px' }
      }));

      // 添加所有景点标记
      addAllAttractionMarkers();
    });
  } catch (error) {
    console.error('初始化地图失败:', error);
  }
};

// 添加所有景点标记
const addAllAttractionMarkers = async () => {
  if (!map.value || !props.planData?.travel_plan) return;

  console.log('开始添加景点标记...');
  
  // 清除现有标记
  markers.value.forEach(marker => marker.setMap(null));
  markers.value = [];

  for (const [dayIndex, day] of props.planData.travel_plan.entries()) {
    console.log(`处理第${dayIndex + 1}天的景点...`);
    const dayMarkers = [];
    
    if (day.itinerary.morning.attraction) {
      const marker = await addMarker(day.itinerary.morning.attraction, '上午', dayIndex);
      if (marker) {
        dayMarkers.push(marker);
      }
    }
    if (day.itinerary.afternoon.attraction) {
      const marker = await addMarker(day.itinerary.afternoon.attraction, '下午', dayIndex);
      if (marker) {
        dayMarkers.push(marker);
      }
    }
    
    markers.value.push(...dayMarkers);
  }

  if (markers.value.length > 0) {
    // 调整地图视野以包含所有标记，并设置合适的边距
    map.value.setFitView(
      markers.value,
      false,
      [100, 100, 100, 100],  // 四周留出更大的边距
      13  // 设置最小缩放级别
    );
  }
  
  console.log('景点标记添加完成');
};

// 添加标记
const addMarker = async (sceneName, timeSlot, dayIndex) => {
  try {
    // 先检查缓存
    if (sceneLocationCache.value.has(sceneName)) {
      console.log(`【Map组件】使用缓存的景点位置信息: ${sceneName}`);
      const locationData = sceneLocationCache.value.get(sceneName);
      return createMarker(locationData, timeSlot, dayIndex);
    }

    // 直接使用高德地图的PlaceSearch进行搜索
    return new Promise((resolve) => {
      console.log(`【Map组件】使用PlaceSearch搜索景点: ${sceneName}`);
      window.AMap.plugin(['AMap.PlaceSearch'], () => {
        const placeSearch = new window.AMap.PlaceSearch({
          city: props.planData?.travel_plan?.[0]?.city || '全国',
          citylimit: true,
          pageSize: 1
        });
        
        placeSearch.search(sceneName, (status, result) => {
          if (status === 'complete' && result.poiList?.pois?.length > 0) {
            const poi = result.poiList.pois[0];
            console.log('【Map组件】PlaceSearch找到位置:', poi);
            
            const locationData = {
              longitude: poi.location.lng,
              latitude: poi.location.lat,
              address: poi.address,
              name: sceneName
            };
            
            // 保存到缓存
            sceneLocationCache.value.set(sceneName, locationData);
            
            const marker = createMarker(locationData, timeSlot, dayIndex);
            resolve(marker);
          } else {
            console.warn(`【Map组件】未找到景点 ${sceneName} 的位置信息`);
            resolve(null);
          }
        });
      });
    });

  } catch (error) {
    console.error(`【Map组件】获取景点 ${sceneName} 位置失败:`, error);
    return null;
  }
};

// 创建标记的辅助函数
const createMarker = (location, timeSlot, dayIndex) => {
  console.log('开始创建标记:', {
    位置: location,
    时段: timeSlot,
    天数: dayIndex + 1
  });

  // 创建自定义标记内容
  const markerContent = document.createElement('div');
  markerContent.className = 'custom-marker';
  markerContent.innerHTML = `
    <span class="day-number">${dayIndex + 1}</span>
    <span class="marker-title">${location.name}</span>
  `;

  // 计算标记的偏移量，根据时段和天数错开位置
  const baseOffset = -10;
  const offsetX = timeSlot === '上午' ? baseOffset - (dayIndex * 10) : baseOffset + (dayIndex * 10);
  const offsetY = timeSlot === '上午' ? baseOffset - (dayIndex * 5) : baseOffset + (dayIndex * 5);

  const marker = new window.AMap.Marker({
    position: [location.longitude, location.latitude],
    content: markerContent,
    title: location.name,
    map: map.value,
    offset: new window.AMap.Pixel(offsetX, offsetY),
    zIndex: 100 - (dayIndex * 2) - (timeSlot === '下午' ? 1 : 0) // 确保新的标记在上层
  });

  let infoWindow = null;

  // 在创建标记时就搜索附近美食
  searchNearbyFood(location.name, timeSlot, location).then(foodList => {
    console.log('【Map组件-createMarker】获取到的美食列表:', {
      景点: location.name,
      时段: timeSlot,
      数量: foodList.length,
      列表: foodList.map(f => f.name)
    });
    
    // 创建信息窗口内容
    infoWindow = new window.AMap.InfoWindow({
      content: `
        <div class="info-window">
          <h3>${location.name}</h3>
          <p class="info-time">第${numberToChinese(dayIndex + 1)}天 ${timeSlot}</p>
          <div class="info-section">
            <div class="section-title">🍽️ 附近美食</div>
            <div class="section-content">
              ${foodList.length > 0 
                ? foodList.map(food => `<span class="food-name">${food.name}</span>`).join('')
                : '<p class="no-food">暂无附近美食信息</p>'
              }
            </div>
          </div>
        </div>
      `,
      offset: new window.AMap.Pixel(0, -30)
    });
  }).catch(error => {
    console.error('【Map组件-createMarker】搜索美食时发生错误:', error);
    infoWindow = new window.AMap.InfoWindow({
      content: `
        <div class="info-window">
          <h3>${location.name}</h3>
          <p class="info-time">第${numberToChinese(dayIndex + 1)}天 ${timeSlot}</p>
          <p class="error">获取美食信息失败</p>
        </div>
      `,
      offset: new window.AMap.Pixel(0, -30)
    });
  });

  // 添加鼠标悬停事件
  marker.on('mouseover', () => {
    console.log(`标记被悬停: ${location.name}`);
    if (infoWindow) {
      infoWindow.open(map.value, marker.getPosition());
    }
  });

  // 添加鼠标离开事件
  marker.on('mouseout', () => {
    console.log(`标记离开: ${location.name}`);
    if (infoWindow) {
      infoWindow.close();
    }
  });

  return marker;
};

// 高亮显示某天的景点
const highlightDay = (dayIndex) => {
  clearHighlight();

  if (dayIndex === -1) return;

  const dayMarkers = markers.value.filter((_, index) => {
    const markerDayIndex = Math.floor(index / 2);
    return markerDayIndex === dayIndex;
  });

  dayMarkers.forEach(marker => {
    // 使用高德地图的动画常量
    if (window.AMap && window.AMap.Animation) {
      marker.setAnimation(window.AMap.Animation.BOUNCE);
    }
    highlightedMarkers.value.push(marker);
  });
};

// 清除高亮
const clearHighlight = () => {
  highlightedMarkers.value.forEach(marker => {
    if (marker && typeof marker.setAnimation === 'function') {
      marker.setAnimation(null);
    }
  });
  highlightedMarkers.value = [];
};

// 数字转中文
const numberToChinese = (num) => {
  const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num <= 10) return chineseNums[num];
  if (num < 20) return '十' + (num % 10 === 0 ? '' : chineseNums[num % 10]);
  return chineseNums[Math.floor(num / 10)] + '十' + (num % 10 === 0 ? '' : chineseNums[num % 10]);
};

// 监听高亮天数变化
watch(() => props.highlightDayIndex, (newIndex) => {
  highlightDay(newIndex);
});

// 监听计划数据变化
watch(() => props.planData, () => {
  nextTick(() => {
    if (map.value) {
      addAllAttractionMarkers();
    }
  });
}, { deep: true });

// 监听城市中心点变化
watch(() => props.cityCenter, () => {
  if (map.value && props.cityCenter) {
    map.value.setCenter([props.cityCenter.longitude, props.cityCenter.latitude]);
  }
}, { deep: true });

// 组件挂载时初始化地图
onMounted(() => {
  // 确保高德地图 API 已加载
  if (!window.AMap) {
    console.error('高德地图 JS API 未加载');
    return;
  }
  
  initMap();
});

// 暴露方法给父组件
defineExpose({
  refreshMarkers: () => {
    if (map.value) {
      addAllAttractionMarkers();
    }
  },
  destroy: () => {
    if (map.value) {
      try {
        map.value.destroy();
      } catch (error) {
        console.error('销毁地图时出错:', error);
      }
      map.value = null;
    }
    markers.value.forEach(marker => {
      try {
        marker.setMap(null);
      } catch (error) {
        console.error('清除标记时出错:', error);
      }
    });
    markers.value = [];
  },
  searchNearbyFood,
  updateFoodListFromCache  // 暴露新方法
});

// 组件卸载时清理资源
onUnmounted(() => {
  if (map.value) {
    try {
      map.value.destroy();
    } catch (error) {
      console.error('组件卸载时销毁地图出错:', error);
    }
    map.value = null;
  }
  markers.value.forEach(marker => {
    try {
      marker.setMap(null);
    } catch (error) {
      console.error('组件卸载时清除标记出错:', error);
    }
  });
  markers.value = [];
  
  // 清理缓存
  sceneLocationCache.value.clear();
  sceneFoodCache.value.clear();
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

:deep(.custom-marker) {
  display: flex;
  align-items: center;
  background: white;
  padding: 4px 8px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  cursor: pointer;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.custom-marker:hover) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 999 !important;
}

:deep(.day-number) {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

:deep(.marker-title) {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.info-window) {
  padding: 0;
  max-width: 240px;
  background: transparent;
  border: none;
  box-shadow: none;
}

:deep(.info-window h3) {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px;
  border-radius: 6px 6px 0 0;
}

:deep(.info-time) {
  color: #666;
  font-size: 13px;
  margin: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 4px 8px 8px;
  display: block;
  border-radius: 0;
}

:deep(.info-section) {
  margin: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 8px;
}

:deep(.info-section:last-child) {
  border-radius: 0 0 6px 6px;
}

:deep(.section-title) {
  font-size: 13px;
  color: #1a73e8;
  font-weight: 600;
  margin-bottom: 4px;
}

:deep(.section-content) {
  margin: 0;
}

:deep(.food-name) {
  display: block;
  font-size: 13px;
  color: #333;
  padding: 4px 0;
  margin: 2px 0;
}

:deep(.no-food) {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 4px 0;
  margin: 0;
}
</style>