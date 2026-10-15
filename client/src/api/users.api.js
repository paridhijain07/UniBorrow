import { api } from "./axiosConfig";

export const getUserProfile = async (id) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const updateProfile = async (payload) => {
  const res = await api.put("/users/profile", payload);
  return res.data;
};
