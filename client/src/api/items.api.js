import { api } from "./axiosConfig";

export const getItems = async (params = {}) => {
  const res = await api.get("/items", { params });
  return res.data;
};

export const getItemById = async (id) => {
  const res = await api.get(`/items/${id}`);
  return res.data;
};

export const createItem = async (payload) => {
  const res = await api.post("/items", payload);
  return res.data;
};

export const updateItem = async (id, payload) => {
  const res = await api.put(`/items/${id}`, payload);
  return res.data;
};

