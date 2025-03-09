import myAxios from "../util/request.js";

//获取景点详情
export function getSceneDetail(Id) {
    return myAxios.get(`/SceneManagement/sceneDetail/${Id}`);
}