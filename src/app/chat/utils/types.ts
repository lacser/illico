export interface Message {
  role: "user" | "assistant";
  content: string;
  isComplete?: boolean;
}
