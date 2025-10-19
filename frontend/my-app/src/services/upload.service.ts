// src/services/upload.service.ts
import apiClient from "./api-client";

const uploadService = {
  uploadImage: async (file: File): Promise<{ filePath: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post<{ filePath: string }>(
      "/files/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },
};

export default uploadService;
