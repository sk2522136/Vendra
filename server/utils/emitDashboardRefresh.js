import { io } from "../server.js";

export const emitDashboardRefresh = (data = {}) => {
  io.emit("dashboard:refresh", data);
};