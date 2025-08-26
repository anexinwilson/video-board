import axios from "axios";

const backendApi = axios.create({
  baseURL: "http://localhost:8001",
});

export default backendApi;
