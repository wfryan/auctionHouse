import axios from "axios";
import { getToken } from "./cookie";

const instance = axios.create({
    baseURL: "https://9cf5it1p4d.execute-api.us-east-2.amazonaws.com/auctionHouse"
})

instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default instance;