import { remove } from "aws-amplify/storage";
import { fetchAuthSession } from "aws-amplify/auth";
import { Schema } from "@/amplify/data/resource";
import { client } from "@/src/utils/client";
export interface UploadFileResult {
  path: string;
  fileName: string;
}

export async function deleteTodoAndFile(todo: Schema["Todo"]["type"]) {
  const session = await fetchAuthSession();
  const identityId = session.identityId;

  // 1. Try to delete the file first (if present)
  if (todo.fileName && identityId) {
    console.log("Deleting file from storage:", todo);
    try {
      await remove({
        path: getFilePath({
          userId: identityId,
          fileName: todo.fileName,
        }),
        // optional if you use a named bucket; omit if using default
        // options: { bucket: "amplify-gen2-next--todo-app" },
      });
    } catch (err) {
      console.error("Failed to delete file from storage:", err);
      // up to you: either continue or abort todo delete
    }
  }

  // 2. Delete the todo
  await client.models.Todo.delete({ id: todo.id });
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
