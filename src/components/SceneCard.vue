<template>
  <a-card
    hoverable
    class="scene-card"
    :bordered="false"
    @click="handleCardClick"
  >
    <template #cover>
      <div class="image-wrapper">
        <img :alt="scene.name" :src="scene.imgurl.split(';')[0]" />
        <div class="image-overlay"></div>
      </div>
    </template>
    <template #title>
      <div class="card-title">{{ scene.name }}</div>
    </template>
    <a-card-meta>
      <template #description>
        <div class="scene-description">{{ scene.description }}</div>
        <div class="scene-meta">
          <a-space>
            <a-tag :color="null" class="custom-tag">
              <EnvironmentOutlined />
              {{ scene.city }}
            </a-tag>
            <a-tag :color="null" class="custom-tag">
              <StarOutlined />
              {{ scene.score }}
            </a-tag>
            <a-tag v-if="scene.price" :color="null" class="custom-tag">
              <ShoppingOutlined />
              ¥{{ scene.price }}
            </a-tag>
          </a-space>
        </div>
        <div class="scene-address">
          <EnvironmentOutlined />
          {{ scene.address }}
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
  scene: {
    type: Object,
    required: true,
  },
});

const handleCardClick = () => {
  router.push(`/scene-detail/${props.scene.id}`);
};
</script>

<style scoped>
.scene-card {
  height: 100%;
  background: #fff;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}

.scene-card:hover {
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

.scene-card:hover .image-wrapper img {
  transform: scale(1.05);
}

.scene-card:hover .image-overlay {
  opacity: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #000;
  margin-bottom: 8px;
}

.scene-description {
  color: #666;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
  font-size: 13px;
}

.scene-meta {
  margin-top: 12px;
  margin-bottom: 8px;
}

.scene-address {
  color: #999;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.scene-address :deep(.anticon) {
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
