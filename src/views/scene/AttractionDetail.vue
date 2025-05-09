<template>
  <div class="attraction-detail">
    <div class="main-content">
      <!-- 基本信息 -->
      <div class="basic-info">
        <div class="header-section">
          <a-button
            :type="isFavorited ? 'primary' : 'default'"
            shape="circle"
            class="favorite-btn"
            @click="handleFavoriteClick"
            :loading="favoriteLoading"
          >
            <template #icon><star-outlined /></template>
          </a-button>
          <div class="title-section">
            <div class="title-wrapper">
              <h1>{{ attractionData.name }}</h1>
            </div>
            <div class="score-section">
              <a-rate :value="Number(attractionData.score)" disabled allow-half />
              <span class="score">{{ attractionData.score }}分</span>
            </div>
          </div>
          <div class="location-tags">
            <a-tag color="blue">{{ attractionData.province }}</a-tag>
            <a-tag color="green">{{ attractionData.city }}</a-tag>
          </div>
        </div>

        <div class="info-list">
          <div class="info-item">
            <div class="info-label">
              <environment-outlined />
              <span>地址：</span>
            </div>
            <div class="info-content">{{ attractionData.address }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <money-collect-outlined />
              <span>门票：</span>
            </div>
            <div class="info-content">
              {{ attractionData.price ? `￥${attractionData.price}` : "免费" }}
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <fire-outlined />
              <span>评论数：</span>
            </div>
            <div class="info-content">{{ attractionData.comment_num }} 条点评</div>
          </div>
        </div>
      </div>
      <!-- 图片轮播 -->
      <div class="carousel-container">
        <a-carousel
          arrows
          dots-class="slick-dots slick-thumb"
          class="carousel"
          autoplay
          effect="fade"
        >
          <template #customPaging="props">
            <a>
              <img :src="imageList[props.i]" />
            </a>
          </template>
          <div
            v-for="(img, index) in imageList"
            :key="index"
            class="carousel-slide"
          >
            <img :src="img" :alt="attractionData.name" />
          </div>
        </a-carousel>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 标签 -->
      <div class="tags-section">
        <h3>标签</h3>
        <div class="tags-container">
          <a-tag v-for="tag in tagsList" :key="tag" color="purple">
            {{ tag }}
          </a-tag>
        </div>
      </div>

      <!-- 开放时间 -->
      <div class="open-time-section">
        <h3>开放时间</h3>
        <a-typography-paragraph>
          {{ attractionData.time }}
        </a-typography-paragraph>
      </div>

      <!-- 景点特色 -->
      <div class="features-section">
        <h3>景点特色</h3>
        <a-typography-paragraph>
          {{ attractionData.features }}
        </a-typography-paragraph>
      </div>

      <!-- 详细描述 -->
      <div class="description-section">
        <h3>详细介绍</h3>
        <a-typography-paragraph>
          {{ attractionData.description }}
        </a-typography-paragraph>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  EnvironmentOutlined,
  MoneyCollectOutlined,
  FireOutlined,
  StarOutlined,
} from "@ant-design/icons-vue";
import { getAttractionDetail } from "@/api/attraction.js";
import { addStar, removeStar, getStars } from "@/api/user.js";
import { message } from "ant-design-vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const isFavorited = ref(false);
const favoriteLoading = ref(false);

const attractionData = ref({
  id: 1,
  name: "",
  url: "",
  address: "",
  comment_num: 0,
  score: "0",
  price: "",
  imgurl: "",
  time: "",
  features: "",
  province: "",
  description: "",
  tags: "",
  city: "",
});

const imageList = ref([]);
const tagsList = ref([]);
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const checkIfFavorited = async () => {
  try {
    if (!userStore.isLoggedIn) return;
    const res = await getStars(userStore.id);
    const favoriteList = res.data || [];
    isFavorited.value = favoriteList.some(item => item.id === Number(props.id));
  } catch (error) {
    console.error("检查收藏状态失败:", error);
  }
};

const handleFavoriteClick = async () => {
  if (!userStore.isLoggedIn) {
    message.warning("请先登录后再收藏");
    return;
  }

  try {
    favoriteLoading.value = true;
    if (isFavorited.value) {
      await removeStar(userStore.id, Number(props.id));
      message.success("取消收藏成功");
      isFavorited.value = false;
    } else {
      await addStar({ 
        userId: userStore.id, 
        attractionid: Number(props.id)  
      });
      message.success("收藏成功");
      isFavorited.value = true;
    }
  } catch (error) {
    message.error("操作失败，请稍后重试");
    console.error("收藏操作失败:", error);
  } finally {
    favoriteLoading.value = false;
  }
};

onMounted(async () => {
  try {
    // 调用 API 获取数据
    const res = await getAttractionDetail(props.id);
    attractionData.value = res.data;

    // 处理图片列表
    if (attractionData.value.imgurl) {
      imageList.value = attractionData.value.imgurl.split(";");
    }
    // 处理标签列表
    if (attractionData.value.tags) {
      try {
        tagsList.value = JSON.parse(attractionData.value.tags);
      } catch (e) {
        console.error("解析标签失败:", e);
        tagsList.value = [];
      }
    }
    // 处理特色列表
    if (attractionData.value.features) {
      try {
        const featuresArray = JSON.parse(attractionData.value.features);
        attractionData.value.features = Array.isArray(featuresArray)
          ? featuresArray.join("\n")
          : featuresArray;
      } catch (e) {
        console.error("解析特色列表失败:", e);
      }
    }

    // 检查是否已收藏
    await checkIfFavorited();
  } catch (error) {
    console.error("获取景点详情失败:", error);
  }
});

const onChange = (current) => {
  console.log("切换到:", current);
};
</script>

<style scoped>
.attraction-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.main-content {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.carousel-container {
  flex: 1;
  position: relative;
  max-width: 700px;
  margin-right: 100px;
}

.carousel {
  border-radius: 8px;
  background: rgba(241, 240, 240, 0.96);
  height: 390px;
  width: 100%;
}

/* 主图样式 */
:deep(.slick-slide img) {
  border: 5px solid #fff;
  display: block;
  margin: auto;
  max-width: 100%;
  height: 390px;
  object-fit: contain;
}

/* 缩略图导航样式 */
:deep(.slick-dots) {
  position: absolute !important;
  right: -100px !important;
  top: 0 !important;
  width: 90px !important;
  height: 390px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start;
  padding: 10px;
  overflow-y: auto;
}

:deep(.slick-arrow) {
  display: none !important;
}

:deep(.slick-thumb) {
  height: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
}

:deep(.slick-thumb li) {
  width: 80px !important;
  height: 60px !important;
  margin: 0 0 10px 0 !important;
  cursor: pointer;
}

:deep(.slick-thumb li img) {
  width: 100%;
  height: 100%;
  filter: grayscale(100%);
  display: block;
  object-fit: cover;
  border-radius: 4px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

:deep(.slick-thumb li.slick-active img) {
  filter: grayscale(0%);
  border-color: #1890ff;
}

.basic-info {
  width: 400px;
  min-width: 450px;
  height: 390px;
  padding: 40px;
  background: rgb(251, 253, 255);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-section {
  position: relative;
  padding-right: 50px; /* 为收藏按钮留出空间 */
}

.title-section {
  margin-bottom: 16px;
}

.title-section h1 {
  margin: 0 0 12px 0;
  font-size: 28px;
  line-height: 1.2;
}

.score {
  color: #faad14;
  font-size: 16px;
}

.location-tags {
  margin-bottom: 24px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-content {
  color: #333;
  font-size: 15px;
  padding-left: 24px;
}

.content-wrapper {
  padding: 0 24px;
  background: rgb(251, 253, 255);
}

.tags-section,
.features-section,
.description-section {
  margin-bottom: 32px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

h3 {
  font-size: 20px;
  margin-bottom: 16px;
  color: #1890ff;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 添加收藏按钮样式 */
.favorite-btn {
  position: absolute;
  top: 0;
  right: 0;
  margin-top: 0;
}
</style>
