import { useState } from "react";

import { Button } from "@/components/common/button/Button";

import { useUploadFile } from "@/hooks/api/useFiles";
import { useUIStore } from "@/stores/uiStore";

export function FileUploadTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { showSuccessToast, showErrorToast } = useUIStore();
  const uploadFileMutation = useUploadFile();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showErrorToast("Please select a file first");
      return;
    }

    try {
      await uploadFileMutation.mutateAsync({
        file: selectedFile,
        name: selectedFile.name,
        // Optional: specify parentFolderId if needed
        // parentFolderId: "some-folder-id",
      });

      showSuccessToast("File uploaded successfully!");
      setSelectedFile(null);
      // Reset the file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-4">Test File Upload</h2>
      <div className="flex flex-col gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="border p-2 rounded"
        />
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!selectedFile || uploadFileMutation.isPending}
        >
          {uploadFileMutation.isPending ? "Uploading..." : "Upload File"}
        </Button>
      </div>
    </div>
  );
}
