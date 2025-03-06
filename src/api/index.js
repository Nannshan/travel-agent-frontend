import myAxios from "../util/request.js";

//用户注册
export function register(data) {
    return myAxios.post("/user/register", data);
}

//用户登录
export function login(data) {
    return myAxios.post("/user/login", data);
}