<template>
  <div class="plan-container">
    <!-- 左侧计划列表 -->
    <div class="plan-list-container">
      <div class="plan-header">
        <h2>我的行程计划</h2>
      </div>
      
      <div class="plan-list" v-if="sortedPlans.length">
        <div
          v-for="plan in sortedPlans"
          :key="plan.id"
          :class="['plan-item', { active: currentPlanId === plan.id }]"
          @click="handlePlanSelect(plan.id)"
        >
          <div class="plan-item-content">
            <h3>{{ getPlanTitle(plan) }}</h3>
            <p class="plan-date">
              <span class="start-date">出发日期：{{ getStartDate(plan) }}</span>
              <span class="update-date">最后更新 - {{ formatDate(new Date(plan.updated_at)) }}</span>
            </p>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <a-empty description="暂无行程计划" />
      </div>
    </div>

    <!-- 右侧计划详情 -->
    <div class="right-section">
      <TripPlan v-if="currentPlanId" :plan-id="currentPlanId" />
      <div v-else class="empty-state">
        <a-empty description="请选择一个行程计划" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getPlanList } from '@/api/plan';
import TripPlan from '@/components/TripPlan.vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const planList = ref([]);
const currentPlanId = ref(null);

// 格式化日期
const formatDate = (date) => {
  return date.getFullYear() + '-' + 
         String(date.getMonth() + 1).padStart(2, '0') + '-' +
         String(date.getDate()).padStart(2, '0');
};

// 获取计划开始日期
const getStartDate = (plan) => {
  try {
    const travelPlan = typeof plan.travel_plan === 'string' 
      ? JSON.parse(plan.travel_plan) 
      : plan.travel_plan;
    
    if (travelPlan.length > 0 && travelPlan[0].date) {
      return formatDate(new Date(travelPlan[0].date));
    }
  } catch (e) {
    console.error('解析开始日期失败:', e);
  }
  return '未设置';
};

// 获取计划标题
const getPlanTitle = (plan) => {
  if (!plan.travel_plan) return '未命名计划';
  try {
    const travelPlan = typeof plan.travel_plan === 'string' 
      ? JSON.parse(plan.travel_plan) 
      : plan.travel_plan;
    
    if (travelPlan.length > 0) {
      const days = travelPlan.length;
      const city = travelPlan[0].city || '未知城市';
      return `${city}${days}日游`;
    }
  } catch (e) {
    console.error('解析计划标题失败:', e);
  }
  return '未命名计划';
};

// 按开始日期排序计划
const sortedPlans = computed(() => {
  return [...planList.value].sort((a, b) => {
    const dateA = getStartDateObj(a);
    const dateB = getStartDateObj(b);
    return dateA - dateB;
  });
});

// 获取计划开始日期对象
const getStartDateObj = (plan) => {
  try {
    const travelPlan = typeof plan.travel_plan === 'string' 
      ? JSON.parse(plan.travel_plan) 
      : plan.travel_plan;
    
    if (travelPlan.length > 0 && travelPlan[0].date) {
      return new Date(travelPlan[0].date);
    }
  } catch (e) {
    console.error('解析开始日期失败:', e);
  }
  return null;
};

// 加载计划列表
const loadPlanList = async () => {
  try {
    const response = await getPlanList(userStore.userInfo.id);
    planList.value = response.data || [];
  } catch (error) {
    console.error('获取计划列表失败:', error);
  }
};

// 处理计划选择
const handlePlanSelect = (planId) => {
  currentPlanId.value = planId;
};

// 组件挂载时加载计划列表
onMounted(() => {
  loadPlanList();
});
</script>

<style scoped>
.plan-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.plan-list-container {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
  background: #fff;
}

.plan-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
}

.plan-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.plan-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.plan-item {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.plan-item:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

.plan-item.active {
  border-color: #1890ff;
  background: #e6f7ff;
}

.plan-item-content h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.plan-date {
  margin: 8px 0 0;
  font-size: 14px;
  color: #666;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.start-date {
  color: #1890ff;
}

.update-date {
  color: #999;
  font-size: 12px;
}

.right-section {
  flex: 0 0 60%;
  background: #f9f9f9;
  overflow: hidden;
}

.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
</style>