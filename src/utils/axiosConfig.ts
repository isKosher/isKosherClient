import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080", // Set your base URL here
  timeout: 20000,
  withCredentials: true,
});

export default axiosInstance;
