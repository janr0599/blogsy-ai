import axios from "axios";

const api = axios.create({
    baseURL: "https://www.blogsyai.app",
});

export default api;
