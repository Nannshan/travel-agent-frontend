<template>
  <div class="scene-home">
    <div class="filters">
      <div class="filter-container">
        <a-form layout="inline" :model="filterForm" :rules="rules" ref="formRef">
          <a-form-item label="省份" name="province">
            <a-select
              v-model:value="filterForm.province"
              placeholder="请选择省份"
              style="width: 200px"
              @change="handleProvinceChange"
              allowClear
            >
              <a-select-option v-for="province in provinces" :key="province" :value="province">
                {{ province }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="城市" name="city">
            <a-select
              v-model:value="filterForm.city"
              placeholder="请选择城市"
              style="width: 200px"
              @change="handleCityChange"
              :disabled="!filterForm.province"
              allowClear
            >
              <a-select-option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>

        <div class="search-container">
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索景点名称"
            style="width: 250px"
            @change="handleSearchInput"
            @search="handleKeywordSearch"
            allow-clear
          />
        </div>
      </div>
    </div>

    <a-spin :spinning="loading">
      <div class="content-wrapper">
        <a-empty
          v-if="!loading && filteredScenes.length === 0"
          :description="getEmptyDescription"
          class="custom-empty"
        >
          <template #image>
            <img src="../../assets/empty.svg" alt="empty" class="empty-image"/>
          </template>
        </a-empty>
        <template v-else>
          <a-row :gutter="[24, 24]">
            <a-col
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              v-for="scene in currentPageScenes"
              :key="scene.id"
            >
              <scene-card :scene="scene" />
            </a-col>
          </a-row>
          <div class="pagination-wrapper">
            <a-pagination
              v-model:current="currentPage"
              :total="filteredScenes.length"
              :pageSize="pageSize"
              show-total
              show-size-changer
              :pageSizeOptions="['8', '12', '16', '24']"
              @change="handlePageChange"
              @showSizeChange="handlePageSizeChange"
            />
          </div>
        </template>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import SceneCard from '@/components/SceneCard.vue';
import { getSceneList, searchScene } from '@/api/scene.js';

const formRef = ref();
const scenes = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const searchResults = ref([]);

// 固定的省份列表
const CHINA_PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古',
  '辽宁', '吉林', '黑龙江', '上海', '江苏',
  '浙江', '安徽', '福建', '江西', '山东',
  '河南', '湖北', '湖南', '广东', '广西',
  '海南', '重庆', '四川', '贵州', '云南',
  '西藏', '陕西', '甘肃', '青海', '宁夏',
  '新疆', '台湾', '香港', '澳门'
];

const provinces = computed(() => CHINA_PROVINCES);

const cities = computed(() => {
  if (!filterForm.value.province) return [];
  const allScenes = [...scenes.value, ...searchResults.value];
  return [...new Set(
    allScenes
      .filter(scene => scene.province === filterForm.value.province)
      .map(scene => scene.city)
  )].sort();
});

const currentPage = ref(1);
const pageSize = ref(12);

const filterForm = ref({
  province: undefined,
  city: undefined
});

// 监听省份变化，重置城市选择
const handleProvinceChange = () => {
  filterForm.value.city = undefined;
  formRef.value?.validateFields(['province']);
};

// 监听城市变化
const handleCityChange = async () => {
  try {
    await formRef.value?.validateFields(['city']);
    handleSearch();
  } catch (error) {
    // 验证失败不执行搜索
  }
};

// 处理搜索关键词变化
const handleKeywordSearch = async () => {
  if (!searchKeyword.value) {
    searchResults.value = [];
    handleSearch();
    return;
  }

  loading.value = true;
  try {
    const response = await searchScene(searchKeyword.value);
    searchResults.value = response.data;
    currentPage.value = 1; // 重置到第一页
  } catch (error) {
    message.error('搜索景点失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 使用防抖处理搜索
let searchTimeout;
const handleSearchInput = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleKeywordSearch();
  }, 500); // 500ms 后执行搜索
};

// 获取空状态描述文本
const getEmptyDescription = computed(() => {
  if (searchKeyword.value) {
    return '未找到相关景点';
  }
  if (!filterForm.value.province && !filterForm.value.city) {
    return '请选择省份和城市或搜索景点';
  }
  return '暂无符合条件的景点';
});

// 过滤后的场景列表
const filteredScenes = computed(() => {
  const allScenes = searchKeyword.value ? searchResults.value : scenes.value;
  
  // 如果没有任何筛选条件，直接返回空数组
  if (!searchKeyword.value && !filterForm.value.province && !filterForm.value.city) {
    return [];
  }
  
  return allScenes.filter(scene => {
    // 如果有省份筛选，检查省份匹配
    if (filterForm.value.province && scene.province !== filterForm.value.province) {
      return false;
    }
    
    // 如果有城市筛选，检查城市匹配
    if (filterForm.value.city && scene.city !== filterForm.value.city) {
      return false;
    }
    
    return true;
  });
});

// 当前页显示的场景列表
const currentPageScenes = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredScenes.value.slice(startIndex, endIndex);
});

const handleSearch = async () => {
  if (searchKeyword.value) {
    handleKeywordSearch();
    return;
  }

  loading.value = true;
  try {
    const response = await getSceneList();
    scenes.value = response.data;
    searchResults.value = []; // 清空搜索结果
    currentPage.value = 1; // 重置到第一页
  } catch (error) {
    message.error('获取景点数据失败');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handlePageSizeChange = (current, size) => {
  pageSize.value = size;
  currentPage.value = 1; // 切换每页条数时重置到第一页
};

onMounted(() => {
  handleSearch();
});
</script>

<style scoped>
.scene-home {
  padding: 24px;
}

.filters {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.search-container {
  margin-left: auto;
}

.content-wrapper {
  background: transparent;
  min-height: 200px;
}

.pagination-wrapper {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.custom-empty {
  :deep(.ant-empty-image) {
    height: auto;
    margin-bottom: 32px;
  }
  
  :deep(.ant-empty-description) {
    color: rgba(0, 0, 0, 0.65);
  }
}

.empty-image {
  height: 160px;
  width: auto;
  margin-bottom: 8px;
}

:deep(.ant-rate) {
  font-size: 16px;
}
</style>
  