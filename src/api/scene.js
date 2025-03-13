import myAxios from "../util/request.js";

//获取景点详情
export function getSceneDetail(Id) {
    return myAxios.get(`/api/SceneManagement/sceneDetail/${Id}`);
}

//获取景点列表
export function getSceneList() {
    return myAxios.get(`/api/SceneManagement/sceneList`);
}

//根据名称搜索景点
export function searchScene(name) {
    return myAxios.get(`/api/SceneManagement/sceneByName/${name}`);
}
