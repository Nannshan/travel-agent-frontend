import axios from "axios";

const myAxios = axios.create({
    timeout: 1000000,
    withCredentials: true
});

// add a request interceptor
myAxios.interceptors.request.use(
    function(config) {
        // do something before request is sent
        return config;
    },
    function(error) {
        // do something with request error
        return Promise.reject(error);
    }
);

// add a response interceptor
// myAxios.interceptors.response.use(
//     function(response) {
//         // do something with response data
//         // console.log(response);
//         const { data } = response;
//         // console.log(data);
//         //未登录
//         if (data.code === 401) {
//             window.location.href = "/user";
//         }
//         return response;
//     },
//     function(error) {
//         // do something with response error
//         return Promise.reject(error);
//     }
// );

export default myAxios;