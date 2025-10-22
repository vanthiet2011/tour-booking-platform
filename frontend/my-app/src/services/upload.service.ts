import apiClient from "./api-client";

const uploadService = {
  // Đổi tên hàm thành uploadImage để rõ nghĩa hơn
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

  uploadMultipleImages: async (
    files: File[]
  ): Promise<{ filePaths: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const { data } = await apiClient.post<{ filePaths: string[] }>(
      "/files/upload-multiple",
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
