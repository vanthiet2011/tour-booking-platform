import apiClient from "./api-client";
import { Category } from "@/types/destination";

class CategoryService {
  async getAll(): Promise<Category[]> {
    const res = await apiClient.get<Category[]>("/categories");
    return res.data;
  }
}

const categoryService = new CategoryService();
export default categoryService;
