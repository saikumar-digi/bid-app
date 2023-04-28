const axios = require("axios");

const url =
  process.env.NODE_ENV === "production"
    ? "https://ipl-mega-auction.herokuapp.com/"
    : "http://localhost:8085/";

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: url,
});

export default axiosInstance;
