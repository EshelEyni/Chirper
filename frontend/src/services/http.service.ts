import Axios, { Method } from "axios";

const BASE_URL = process.env.NODE_ENV === "production" ? "/api/" : "http://localhost:3030/api/";

const axios = Axios.create({
  withCredentials: true,
});

export const httpService = {
  get(endpoint: string, data?: object) {
    return ajax(endpoint, "GET", data);
  },
  post(endpoint: string, data?: object) {
    return ajax(endpoint, "POST", data);
  },
  put(endpoint: string, data?: object) {
    return ajax(endpoint, "PUT", data);
  },
  patch(endpoint: string, data?: object) {
    return ajax(endpoint, "PATCH", data);
  },
  delete(endpoint: string, data?: object) {
    return ajax(endpoint, "DELETE", data);
  },
};

async function ajax(endpoint: string, method: Method = "GET", data: object | null = null) {
  try {
    const res = await axios({
      url: `${BASE_URL}${endpoint}`,
      method,
      data,
      params: method === "GET" ? data : null,
    });
    return res.data;
  } catch (err) {
    if (data) {
      delete (data as any)["password"];
    }
    console.log(`Had issues ${method}ing to the backend, endpoint: ${endpoint}, with data: `, data);
    console.error(err);
    throw err;
  }
}
