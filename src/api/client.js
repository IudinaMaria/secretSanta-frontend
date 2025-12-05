import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export function setAdminToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("adminToken", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("adminToken");
  }
}
