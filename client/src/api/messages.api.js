import { api } from "./axiosConfig";

// Send message
export const sendMessage = async ({ receiverId, text, itemId }) => {
  const res = await api.post("/messages", {
    receiverId,
    text,
    itemId,
  });
  return res.data;
};

// Get all conversations
export const getConversations = async () => {
  const res = await api.get("/messages/conversations");
  return res.data;
};

// Get chat thread
export const getThread = async (userId) => {
  const res = await api.get(`/messages/${userId}`);
  return res.data;
};