import myAxios from "../util/request.js";

//获取城市详情
export function getCityDetail(name) {
    return myAxios.get(`/api/SceneManagement/cityDetail/${name}`);
}

//获取城市坐标
export function getCityCenterDetail(name) {
    return myAxios.get(`/api/SceneManagement/cityCenters/${name}`);
}