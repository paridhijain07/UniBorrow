import { api } from "./axiosConfig";

export const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const markAllRead = async () => {
  const res = await api.put("/notifications/read-all");
  return res.data;
};

export const getUnreadCount = async () => {
  const res = await api.get("/notifications/unread-count");
  return res.data;
};