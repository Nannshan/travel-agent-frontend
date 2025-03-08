import myAxios from "../util/request.js";

//用户注册
export function register(data) {
    return myAxios.post("/UserManagement/register", data);
}

//用户登录
export function login(data) {
    return myAxios.post("/UserManagement/login", data);
}

// 获取收藏的景点列表
export function getStars(Id) {
    return myAxios.get(`/UserManagement/starList/${Id}`);
}

// 取消收藏景点
export function removeStar(userId, sceneId) {
    return myAxios.delete(`/UserManagement/starRemove/${userId}/${sceneId}`);
}

// 添加景点到收藏
export function addStar(data) {
    return myAxios.post(`/UserManagement/starList/${id}`);
}