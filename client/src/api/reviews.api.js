import { api } from "./axiosConfig";

export const getReviewsForItem = async (itemId) => {
  const res = await api.get(`/reviews/item/${itemId}`);
  return res.data;
};

export const createReview = async (payload) => {
  const res = await api.post("/reviews", payload);
  return res.data;
};

