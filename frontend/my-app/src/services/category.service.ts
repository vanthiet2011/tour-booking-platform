// src/services/category.service.ts
import apiClient from "./api-client";
import { Category } from "@/types/destination";

class CategoryService {
  async getAll(): Promise<Category[]> {
    const res = await apiClient.get<Category[]>("/categories");
    return res.data;
  }
}

export default new CategoryService();
