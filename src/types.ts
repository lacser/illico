export interface Message {
  role: "user" | "assistant";
  content: string;
  isComplete?: boolean;
}

export interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}