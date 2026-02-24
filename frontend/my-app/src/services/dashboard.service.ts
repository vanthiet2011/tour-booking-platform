import { DashboardStats } from "@/types/dashboard";
import apiClient from "./api-client";

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get<DashboardStats>("/Dashboard/stats");
  return data;
};
