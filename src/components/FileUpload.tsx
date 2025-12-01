"use client";

import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { FileUploader } from "@aws-amplify/ui-react-storage";
import type { FileUploaderHandle } from "@aws-amplify/ui-react-storage";
import { getUploadPath, type UploadFileResult } from "@/src/utils/fileUpload";
import { useAuthenticator } from "@aws-amplify/ui-react";

interface FileUploadProps {
  onUploadStart?: () => void;
  onUploadComplete?: (result: UploadFileResult) => void;
  onUploadError?: (error: Error) => void;
  disabled?: boolean;
  hasFile?: boolean;
}

export interface FileUploadRef {
  clearFiles: () => void;
}

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(
  (
    {
      onUploadStart,
      onUploadComplete,
      onUploadError,
      disabled = false,
      hasFile = false,
    },
    ref
  ) => {
    const all = useAuthenticator();

    const fileUploaderRef = useRef<FileUploaderHandle>(null);

    const [isUploading, setIsUploading] = useState(false);

    useImperativeHandle(ref, () => ({
      clearFiles: () => {
        fileUploaderRef.current?.clearFiles();
      },
    }));

    const handleUploadStart = (event: { key?: string }) => {
      setIsUploading(true);
      onUploadStart?.();
    };

    const handleUploadSuccess = (event: { key?: string }) => {
      setIsUploading(false);
      console.log("event:", event);
      if (event.key) {
        // Extract file name from key (key format: private/{entity_id}/{fileName})
        const fileName = event.key.split("/").pop() || "";
        onUploadComplete?.({
          path: event.key,
          fileName: fileName,
        });
      }
    };

    const handleUploadError = (error: string, file: { key: string }) => {
      setIsUploading(false);
      onUploadError?.(new Error(error));
    };

    return (
      <FileUploader
        ref={fileUploaderRef}
        path={({ identityId }) => getUploadPath({ userId: identityId ?? "" })}
        acceptedFileTypes={["image/*"]}
        maxFileCount={1}
        isResumable={false}
        onUploadStart={handleUploadStart}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />
    );
  }
);

FileUpload.displayName = "FileUpload";

export default FileUpload;
