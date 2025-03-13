import axios from "axios";

const myAxios = axios.create({
    timeout: 1000000,
    withCredentials: true
});


export default myAxios;