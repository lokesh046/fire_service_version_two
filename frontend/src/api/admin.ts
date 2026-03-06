import API from "./axios";

export const uploadRAGDocument = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await API.post("/admin/upload", formData);
    return response.data;
};

export const deleteRAGDocument = async (source: string) => {
    const response = await API.delete("/admin/delete", {
        params: { source },
    });
    return response.data;
};
