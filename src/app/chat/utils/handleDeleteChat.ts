import { AppDispatch } from "@/store/store";
import { deleteChat, setCurrentChatId, setCurrentMessages, setIsNewChat } from "@/store/slices/chatSlice";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  isComplete?: boolean;
}

export const handleDeleteChat = async (
  chatId: string,
  currentChatId: string | null,
  chats: Chat[],
  dispatch: AppDispatch,
  router: AppRouterInstance
) => {
  try {
    const response = await fetch(`/api/chats/${chatId}`, {
      method: "DELETE",
    });

    if (response.status === 401) {
      router.push("/login");
      return;
    }
    if (!response.ok) throw new Error("Failed to delete chat");

    dispatch(deleteChat(chatId));

    if (currentChatId === chatId) {
      const remainingChats = chats.filter((chat) => chat._id !== chatId);
      if (remainingChats.length > 0) {
        dispatch(setCurrentChatId(remainingChats[0]._id));
        dispatch(setCurrentMessages(
          remainingChats[0].messages.map((msg: Message) => ({
            ...msg,
            isComplete: true,
          }))
        ));
      } else {
        dispatch(setCurrentChatId(null));
        dispatch(setIsNewChat(true));
        dispatch(setCurrentMessages([]));
      }
    }
  } catch (error) {
    console.error("Error deleting chat:", error);
  }
};
