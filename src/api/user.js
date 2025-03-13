import myAxios from "../util/request.js";

//用户注册
export function signup(data) {
    return myAxios.post("/api/UserManagement/signup", data);
}

//用户登录
export function login(data) {
    return myAxios.post("/api/UserManagement/login", data);
}

//退出登录
export function logout(data) {
    return myAxios.post("/api/UserManagement/logout", data);
}

//获取用户信息
export function getUserInfo(Id) {
    return myAxios.get(`/api/UserManagement/userDetail/${Id}`);
}

//更新用户信息
export function updateUserInfo(Id, data) {
    return myAxios.put(`/api/UserManagement/userDetail/${Id}`, data);
}

//删除用户
export function deleteUser(Id) {
    return myAxios.delete(`/api/UserManagement/userDetail/${Id}`);
}

// 获取收藏的景点列表
export function getStars(Id) {
    return myAxios.get(`/api/UserManagement/starList/${Id}`);
}

// 取消收藏景点
export function removeStar(userId, sceneId) {
    return myAxios.delete(`/api/UserManagement/starRemove/${userId}/${sceneId}`);
}

// 添加景点到收藏
export function addStar(data) {
    return myAxios.post(`/api/UserManagement/starList/${id}`);
}