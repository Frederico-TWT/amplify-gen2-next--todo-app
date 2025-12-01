import { defineFunction, defineStorage } from "@aws-amplify/backend";

const optimizeImage = defineFunction({
  entry: "./on-upload-optimize/index.ts",
});

export const storage = defineStorage({
  isDefault: true,
  name: "amplify-gen2-next--todo-app",
  access: (allow) => ({
    "private/{entity_id}/*": [
      allow.entity("identity").to(["read", "write", "delete"]),
      allow.resource(optimizeImage).to(["read", "write", "delete"]),
    ],
  }),
  triggers: {
    onUpload: optimizeImage,
  },
});
