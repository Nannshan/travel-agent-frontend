<template>
  <div id="SceneStar" class="scene-star-container">
    <a-page-header title="我的收藏景点" class="page-header" :ghost="true">
      <template #extra>
        <a-button
          type="text"
          @click="$router.push('/scene-home')"
          class="browse-btn"
        >
          <template #icon>
            <SearchOutlined />
          </template>
          浏览景点
        </a-button>
      </template>
    </a-page-header>

    <div class="content-wrapper">
      <a-spin :spinning="loading" tip="加载中...">
        <a-empty
          v-if="!loading && stars.length === 0"
          description="您还没有收藏任何景点"
          class="custom-empty"
        >
          <template #image>
            <img
              src="../../assets/empty.svg"
              alt="empty"
            />
          </template>
          <a-button
            type="text"
            @click="$router.push('/scene-home')"
            class="browse-btn"
          >
            立即浏览
          </a-button>
        </a-empty>

        <a-row :gutter="[24, 24]" v-else>
          <a-col
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            v-for="star in stars"
            :key="star.id"
          >
            <scene-card :scene="star">
              <template #actions>
                <a-popconfirm
                  title="确定要取消收藏这个景点吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="remove(star.id)"
                >
                  <a-button type="text" class="remove-btn">
                    <DeleteOutlined />
                    取消收藏
                  </a-button>
                </a-popconfirm>
              </template>
            </scene-card>
          </a-col>
        </a-row>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getStars, removeStar } from "@/api/user.js";
import { SearchOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import SceneCard from "@/components/SceneCard.vue";

const stars = ref([]);
const loading = ref(true);

const fetchStars = async () => {
  try {
    loading.value = true;
    const userid = 1;
    const response = await getStars(userid);
    stars.value = response.data;
  } catch (error) {
    message.error("获取收藏景点失败");
    console.error("获取收藏景点失败:", error);
  } finally {
    loading.value = false;
  }
};

const remove = async (starId) => {
  try {
    const userid = 1;
    await removeStar(userid, starId);
    stars.value = stars.value.filter((star) => star.id !== starId);
    message.success("取消收藏成功");
  } catch (error) {
    message.error("取消收藏失败");
    console.error("取消收藏失败:", error);
  }
};

onMounted(() => {
  fetchStars();
});
</script>

<style scoped>
.scene-star-container {
  height: 100vh; /* 减去顶部导航栏的高度 */
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.page-header {
  background: transparent;
  padding: 16px 24px;
  margin-bottom: 0;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0; /* 防止头部压缩 */
}

.browse-btn {
  color: #000;
  font-weight: 500;
  transition: all 0.3s;
}

.browse-btn:hover {
  color: #666;
  background: transparent;
}

.content-wrapper {
  flex: 1;
  background: transparent;
  padding: 24px;
  overflow-y: auto; /* 添加垂直滚动 */
  height: 100%;
}

.remove-btn {
  color: #666;
  transition: all 0.3s;
}

.remove-btn:hover {
  color: #ff4d4f;
  background: transparent;
}

.custom-empty {
  padding: 48px 0;
}

:deep(.ant-empty-image) {
  opacity: 0.8;
}
</style>
