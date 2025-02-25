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


// export interface Message {
//   messageId: string;
//   parentId: string | null;
//   branchIds: string[];
//   role: "user" | "assistant";
//   content: string;
//   isComplete?: boolean;
// }

// export interface Chat {
//   _id: string;
//   title: string;
//   messageTree: { [messageId: string]: Message };
//   createdAt: string;
// }