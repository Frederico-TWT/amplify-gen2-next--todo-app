"use client";

import { Card, Flex, Text, Button, Icon } from "@aws-amplify/ui-react";
import { StorageImage } from "@aws-amplify/ui-react-storage";
import { MdDelete } from "react-icons/md";
import type { Schema } from "@/amplify/data/resource";
import { getFilePath } from "../utils/fileUpload";

interface TodoItemProps {
  todo: Schema["Todo"]["type"];
  onDelete: (id: string) => void;
}

// Type guard to ensure we have a valid string path
function isValidPath(path: unknown): path is string {
  return typeof path === "string" && path !== "";
}

export default function TodoItem({ todo, onDelete }: TodoItemProps) {
  const fileName = todo.fileName;
  const hasImage = isValidPath(fileName);
  console.log("fileName:", fileName);

  return (
    <Card
      variation="elevated"
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
    >
      <Flex direction="column" gap="1rem">
        <Flex
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap="1rem"
        >
          <Text
            className="flex-1 text-gray-800 text-lg font-medium"
            isTruncated
          >
            {todo.content}
          </Text>
          <Button
            variation="link"
            size="small"
            onClick={() => onDelete(todo.id)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
            ariaLabel="Delete todo"
          >
            <Icon ariaLabel="Delete" as={MdDelete} />
          </Button>
        </Flex>
        {hasImage && typeof fileName === "string" ? (
          <div className="w-full rounded-lg overflow-hidden">
            <StorageImage
              path={({ identityId }) =>
                getFilePath({ userId: identityId ?? "", fileName: fileName })
              }
              alt=""
              className="w-full h-auto object-contain max-h-64"
            />
          </div>
        ) : null}
      </Flex>
    </Card>
  );
}
