<template>
  <a-card
    hoverable
    class="attraction-card"
    :bordered="false"
    @click="handleCardClick"
  >
    <template #cover>
      <div class="image-wrapper">
        <img :alt="attraction.name" :src="attraction.imgurl.split(';')[0]" />
        <div class="image-overlay"></div>
      </div>
    </template>
    <template #title>
      <div class="card-title">{{ attraction.name }}</div>
    </template>
    <a-card-meta>
      <template #description>
        <div class="attraction-description">{{ attraction.description }}</div>
        <div class="attraction-meta">
          <a-space>
            <a-tag :color="null" class="custom-tag">
              <EnvironmentOutlined />
              {{ attraction.city }}
            </a-tag>
            <a-tag :color="null" class="custom-tag">
              <StarOutlined />
              {{ attraction.score }}
            </a-tag>
            <a-tag v-if="attraction.price" :color="null" class="custom-tag">
              <ShoppingOutlined />
              ¥{{ attraction.price }}
            </a-tag>
          </a-space>
        </div>
        <div class="attraction-address">
          <EnvironmentOutlined />
          {{ attraction.address }}
        </div>
      </template>
    </a-card-meta>
    <template #actions>
      <slot name="actions"></slot>
    </template>
  </a-card>
</template>

<script setup>
import {
  EnvironmentOutlined,
  StarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons-vue";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps({
  attraction: {
    type: Object,
    required: true,
  },
});

const handleCardClick = () => {
  router.push(`/attraction-detail/${props.attraction.id}`);
};
</script>

<style scoped>
.attraction-card {
  height: 100%;
  background: #fff;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}

.attraction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 0.3s;
}

.attraction-card:hover .image-wrapper img {
  transform: scale(1.05);
}

.attraction-card:hover .image-overlay {
  opacity: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  margin-bottom: 8px;
}

.attraction-description {
  color: #666;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  font-size: 13px;
}

.attraction-meta {
  margin-top: 12px;
  margin-bottom: 8px;
}

.attraction-address {
  color: #999;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.attraction-address :deep(.anticon) {
  font-size: 12px;
}

.custom-tag {
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  color: #666;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.custom-tag :deep(.anticon) {
  margin-right: 4px;
}

:deep(.ant-card-meta-title) {
  margin-bottom: 8px;
}

:deep(.ant-card-actions) {
  border-top: 1px solid #f0f0f0;
  padding: 12px;
}

:deep(.ant-card-actions > li) {
  margin: 0;
}
</style>
