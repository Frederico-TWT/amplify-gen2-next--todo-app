import { uploadData } from "aws-amplify/storage";
import { getCurrentUser } from "aws-amplify/auth";

export interface UploadFileResult {
  path: string;
  fileName: string;
}

export const getUploadPath = ({ userId }: { userId: string }) => {
  return `private/${userId}/`;
};

export const getFilePath = ({
  userId,
  fileName,
}: {
  userId: string;
  fileName: string;
}) => {
  return `private/${userId}/${fileName}`;
};
