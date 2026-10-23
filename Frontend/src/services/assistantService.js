import api from "./api";

export const sendAssistantMessage = async (messages) => {
  const response = await api.post(
    "/assistant/chat/",
    { messages },
    { timeout: 180000 }
  );
  return response.data;
};