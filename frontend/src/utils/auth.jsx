import axios from "axios";

export const checkAuth = async () => {
  try {
    const response = await axios.get("/api/check-auth", { withCredentials: true });
    return response.data.message === "Вы авторизованы";
  } catch {
    return false;
  }
};
