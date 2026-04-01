import { api } from "./axiosConfig";

export const authRegister = async (payload) => {
  const res = await api.post("/auth/register", payload);
  return res.data;
};

export const authLogin = async (payload) => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};

export const authMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

