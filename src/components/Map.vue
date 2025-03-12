<template>
  <div ref="mapContainer" class="map-container"></div>
</template>
<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  center: {
    type: Array,
    default: () => [117.1201, 36.6512], // 默认济南市中心坐标
  },
  zoom: {
    type: Number,
    default: 12,
  },
  locations: {
    type: Array,
    default: () => [
      { name: "趵突泉", position: [117.0175, 36.6616] },
      { name: "大明湖", position: [117.0229, 36.6731] },
      { name: "山东省博物馆", position: [117.0412, 36.6605] },
    ],
  },
});

const mapContainer = ref(null);

// 初始化地图
onMounted(() => {
  // 创建地图实例
  const map = new AMap.Map(mapContainer.value, {
    zoom: props.zoom,
    center: props.center,
    viewMode: "3D",
  });

  // 创建标记和信息窗体
  props.locations.forEach((location) => {
    const marker = new AMap.Marker({
      position: location.position,
      title: location.name,
      map: map,
    });

    // 创建信息窗体
    const infoWindow = new AMap.InfoWindow({
      content: `<div class="info-window">
                  <h3>${location.name}</h3>
                  <p>济南著名景点</p>
                </div>`,
      offset: new AMap.Pixel(0, -30),
    });

    // 绑定点击事件
    marker.on("click", () => {
      infoWindow.open(map, marker.getPosition());
    });
  });
});
</script>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
}

.info-window {
  padding: 8px;
}

.info-window h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.info-window p {
  margin: 0;
  color: #666;
}
</style>
