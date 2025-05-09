import myAxios from "../util/request.js";

//用户注册
export function signup(data) {
    return myAxios.post("/api/UserManagement/signup", data);
}

//用户登录
export function login(data) {
    return myAxios.post("/api/UserManagement/login", data);
}

//获取用户信息
export function getUserInfo(Id) {
    return myAxios.get(`/api/UserManagement/userDetail/${Id}`);
}

//更新用户信息
export function updateUserInfo(Id, data) {
    return myAxios.put(`/api/UserManagement/userDetail/${Id}`, data);
}

// 上传用户头像
export function uploadUserAvatar(Id, formData) {
    return myAxios.post(`/api/UserManagement/userDetail/${Id}/avatar`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

// 获取用户统计信息
export function getUserStatic(Id){
    return myAxios.get(`/api/UserManagement/userDetail/${Id}/stats`);
}

//删除用户
export function deleteUser(Id) {
    return myAxios.delete(`/api/UserManagement/userDetail/${Id}`);
}

// 获取用户收藏列表
export function getStars(userId) {
    return myAxios.get(`/api/UserManagement/favoriteList/${userId}`);
}

// 取消收藏
export function removeStar(userId, attractionId) {
    return myAxios.delete(`/api/UserManagement/favoriteRemove/${userId}/${attractionId}`);
}

// 添加收藏
export function addStar(data) {
    return myAxios.post(`/api/UserManagement/favoriteList/${data.userId}`, {
        userid: data.userId,
        attractionid: data.attractionid
    });
}

// 发送邮箱验证码
export function sendEmailCode(email) {
  return myAxios.post("/api/UserManagement/sendEmailCode", {
    email: email,
    type: "login" // 用途：登录验证
  });
}