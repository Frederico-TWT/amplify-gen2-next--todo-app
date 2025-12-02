import { Schema } from "@/amplify/data/resource";
import { generateClient } from "aws-amplify/api";

export const client = generateClient<Schema>();
