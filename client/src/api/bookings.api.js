import { api } from "./axiosConfig";

export const createBooking = async ({ itemId, startDate, endDate }) => {
  const payload = { itemId, startDate, endDate };
  const res = await api.post("/bookings", payload);
  return res.data;
};

export const getMyRequests = async () => {
  const res = await api.get("/bookings/my-requests");
  return res.data;
};

export const getReceivedRequests = async () => {
  const res = await api.get("/bookings/received");
  return res.data;
};

export const approveBooking = async (id) => {
  const res = await api.put(`/bookings/${id}/approve`);
  return res.data;
};

export const rejectBooking = async (id) => {
  const res = await api.put(`/bookings/${id}/reject`);
  return res.data;
};

export const returnBooking = async (id) => {
  const res = await api.put(`/bookings/${id}/return`);
  return res.data;
};
export const getItemBookings = async (itemId) => {
  const res = await api.get(`/bookings/item/${itemId}`);
  return res.data;
};

