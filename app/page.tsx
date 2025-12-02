"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  useAuthenticator,
  Button,
  TextField,
  Card,
  View,
  Flex,
  Heading,
  Text,
  Divider,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import FileUpload, { type FileUploadRef } from "@/src/components/FileUpload";
import TodoItem from "@/src/components/TodoItem";
import { useRef } from "react";
import { deleteTodoAndFile } from "@/src/utils/fileUpload";

Amplify.configure(outputs);

export const client = generateClient<Schema>();

export default function App() {
  const { user, signOut } = useAuthenticator();
  const fileUploadRef = useRef<FileUploadRef>(null);

  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [newTodoContent, setNewTodoContent] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createTodo = async () => {
    if (!newTodoContent.trim()) return;
    if (isUploading) return; // Block submission during upload

    await client.models.Todo.create({
      content: newTodoContent.trim(),
      fileName: uploadedFileName || undefined,
    });
    setNewTodoContent("");
    setUploadedFileName(null);
    // Clear the file uploader after creating todo
    fileUploadRef.current?.clearFiles();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      createTodo();
    }
  };

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  return (
    <View
      as="main"
      className="flex flex-col items-stretch p-8 gap-6 max-w-2xl w-full"
    >
      <Flex direction="column" gap="0.5rem">
        <Heading level={1} className="text-4xl font-bold text-white mb-1">
          {user?.signInDetails?.loginId?.split("@")[0] || "Your"} todos
        </Heading>
        <Text className="text-white/80 text-sm">
          Stay organized and get things done
        </Text>
      </Flex>

      <Card variation="elevated" className="bg-white rounded-xl shadow-lg p-2">
        <Flex direction="column" gap="0.5rem">
          <Flex
            direction="row"
            justifyContent="center"
            gap="0.5rem"
            alignItems="center"
          >
            <TextField
              label=""
              labelHidden
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add a new todo..."
              className="flex-1 w-full"
              size="large"
              hasError={false}
              grow="1"
              disabled={isUploading}
            />
            <Button
              variation="primary"
              onClick={createTodo}
              disabled={!newTodoContent.trim() || isUploading}
              size="large"
              className="px-6"
            >
              Add
            </Button>
          </Flex>
          <FileUpload
            ref={fileUploadRef}
            onUploadStart={() => setIsUploading(true)}
            onUploadComplete={(result) => {
              setUploadedFileName(result.fileName);
              setIsUploading(false);
            }}
            onUploadError={() => {
              setIsUploading(false);
            }}
            disabled={isUploading || !!uploadedFileName}
            hasFile={!!uploadedFileName}
          />
        </Flex>
      </Card>

      {todos.length === 0 ? (
        <Card
          variation="outlined"
          className="bg-white/10 backdrop-blur-sm rounded-xl p-12 text-center border border-white/20"
        >
          <Text className="text-white/70 text-lg">
            No todos yet. Add one above to get started!
          </Text>
        </Card>
      ) : (
        <Flex direction="column" gap="0.75rem">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </Flex>
      )}

      <View className="mt-4 space-y-3 pt-6">
        <Divider className="border-white/20" />
        <Flex direction="column" gap="0.75rem">
          <Text className="text-white/70 text-sm">
            🥳 App successfully hosted. Try creating a new todo.
          </Text>
          <Button
            variation="link"
            as="a"
            href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-300 hover:text-indigo-200 font-medium text-sm underline underline-offset-2 self-start"
          >
            Review next steps of this tutorial →
          </Button>
        </Flex>
      </View>

      <Button
        variation="link"
        onClick={signOut}
        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/20 self-start backdrop-blur-sm"
      >
        Sign out
      </Button>
    </View>
  );
}
