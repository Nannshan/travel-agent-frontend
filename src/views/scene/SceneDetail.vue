<template>
  <div class="scene-detail">
    <div class="main-content">
      <!-- 基本信息 -->
      <div class="basic-info">
        <div class="header-section">
          <div class="title-section">
            <h1>{{ sceneData.name }}</h1>
            <div class="score-section">
              <a-rate :value="Number(sceneData.score)" disabled allow-half />
              <span class="score">{{ sceneData.score }}分</span>
            </div>
          </div>
          <div class="location-tags">
            <a-tag color="blue">{{ sceneData.province }}</a-tag>
            <a-tag color="green">{{ sceneData.city }}</a-tag>
          </div>
        </div>

        <div class="info-list">
          <div class="info-item">
            <div class="info-label">
              <clock-circle-outlined />
              <span>开放时间：</span>
            </div>
            <div class="info-content">{{ sceneData.time }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <environment-outlined />
              <span>地址：</span>
            </div>
            <div class="info-content">{{ sceneData.address }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <money-collect-outlined />
              <span>门票：</span>
            </div>
            <div class="info-content">
              {{ sceneData.price ? `￥${sceneData.price}` : "免费" }}
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">
              <fire-outlined />
              <span>评论数：</span>
            </div>
            <div class="info-content">{{ sceneData.comment_num }} 条点评</div>
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
            <img :src="img" :alt="sceneData.name" />
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

      <!-- 景点特色 -->
      <div class="features-section">
        <h3>景点特色</h3>
        <a-typography-paragraph>
          {{ sceneData.features }}
        </a-typography-paragraph>
      </div>

      <!-- 详细描述 -->
      <div class="description-section">
        <h3>详细介绍</h3>
        <a-typography-paragraph>
          {{ sceneData.description }}
        </a-typography-paragraph>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  MoneyCollectOutlined,
  FireOutlined,
} from "@ant-design/icons-vue";
import { getSceneDetail } from "../../api/scene.js";

const sceneData = ref({
  id: 1,
  name: "",
  sceneurl: "",
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

onMounted(async () => {
  try {
    // 调用 API 获取数据
    const res = await getSceneDetail(props.id);
    sceneData.value = res.data;

    // 处理图片列表
    if (sceneData.value.imgurl) {
      imageList.value = sceneData.value.imgurl.split(";");
    }
    // 处理标签列表
    if (sceneData.value.tags) {
      try {
        tagsList.value = JSON.parse(sceneData.value.tags);
      } catch (e) {
        console.error("解析标签失败:", e);
        tagsList.value = [];
      }
    }
    // 处理特色列表
    if (sceneData.value.features) {
      try {
        const featuresArray = JSON.parse(sceneData.value.features);
        sceneData.value.features = Array.isArray(featuresArray)
          ? featuresArray.join("\n")
          : featuresArray;
      } catch (e) {
        console.error("解析特色列表失败:", e);
      }
    }
  } catch (error) {
    console.error("获取景点详情失败:", error);
  }
});

const onChange = (current) => {
  console.log("切换到:", current);
};
</script>

<style scoped>
.scene-detail {
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
  height: 380px;
  width: 100%;
}

/* 主图样式 */
:deep(.slick-slide img) {
  border: 5px solid #fff;
  display: block;
  margin: auto;
  max-width: 100%;
  height: 380px;
  object-fit: contain;
}

/* 缩略图导航样式 */
:deep(.slick-dots) {
  position: absolute !important;
  right: -100px !important;
  top: 0 !important;
  width: 80px !important;
  height: 380px !important;
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
  height: 380px;
  padding: 40px;
  background: rgb(251, 253, 255);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.title-section {
  margin-bottom: 16px;
}

.title-section h1 {
  margin: 0 0 12px 0;
  font-size: 28px;
  line-height: 1.2;
}

.score-section {
  display: flex;
  align-items: center;
  gap: 8px;
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
</style>
