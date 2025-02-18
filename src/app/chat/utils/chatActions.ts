import { Message } from "../../../types";
import { AppDispatch } from "@/store/store";
import {
  setIsLoading,
  setIsNewChat,
  setCurrentChatId,
  addChat,
  updateChat,
  setCurrentMessages,
} from "@/store/slices/chatSlice";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const updateCurrentChat = async (
  chatId: string,
  messages: Message[],
  dispatch: AppDispatch,
  router: AppRouterInstance,
  wsRef: React.RefObject<WebSocket>
) => {
  if (!chatId) {
    console.error("No chat ID provided");
    return;
  }

  try {
    const response = await fetch(`/api/chats/${chatId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        title: messages[0]?.content.substring(0, 30) + "..." || "New Chat",
      }),
    });

    if (response.status === 401) {
      router.push("/login");
      return;
    }
    if (!response.ok) throw new Error("Failed to update chat");

    const updatedChat = await response.json();
    dispatch(updateChat(updatedChat));
    dispatch(setCurrentMessages(messages));

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          chatId,
          message: messages[messages.length - 1],
        })
      );
    }
  } catch (error) {
    console.error("Error updating chat:", error);
  }
};

const createNewChat = async (
  firstMessage: Message,
  dispatch: AppDispatch,
  router: AppRouterInstance
) => {
  try {
    const response = await fetch("/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: firstMessage.content.substring(0, 30) + "...",
        messages: [firstMessage],
      }),
    });

    if (response.status === 401) {
      router.push("/login");
      return null;
    }
    if (!response.ok) throw new Error("Failed to create chat");

    const newChat = await response.json();
    dispatch(addChat(newChat));
    dispatch(setCurrentChatId(newChat._id));
    dispatch(setIsNewChat(false));
    dispatch(setCurrentMessages([{ ...firstMessage, isComplete: true }]));
    return newChat._id;
  } catch (error) {
    console.error("Error creating chat:", error);
    return null;
  }
};

export const handleSubmit = async (
  text: string,
  isLoading: boolean,
  currentChatId: string | null,
  isNewChat: boolean,
  currentMessages: Message[],
  dispatch: AppDispatch,
  router: AppRouterInstance,
  wsRef: React.RefObject<WebSocket>
) => {
  if (!text.trim() || isLoading) return;

  const userMessage: Message = {
    role: "user",
    content: text.trim(),
    isComplete: true,
  };
  dispatch(setIsLoading(true));

  try {
    let chatId = currentChatId;
    let updatedMessages: Message[] = [];

    if (isNewChat || !chatId) {
      chatId = await createNewChat(userMessage, dispatch, router);
      if (!chatId) throw new Error("Failed to create new chat");
      updatedMessages = [userMessage];
    } else {
      if (!chatId) throw new Error("No current chat ID");
      updatedMessages = [...currentMessages, userMessage];
      await updateCurrentChat(chatId, updatedMessages, dispatch, router, wsRef);
    }

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updatedMessages,
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch response");

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader available");

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      isComplete: false,
    };

    let newMessages: Message[] = [...updatedMessages];
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        assistantMessage.isComplete = true;
        newMessages = [...updatedMessages, { ...assistantMessage }];
        dispatch(setCurrentMessages(newMessages));
        break;
      }

      const text = new TextDecoder().decode(value);
      assistantMessage.content += text;

      newMessages = [...updatedMessages, { ...assistantMessage }];
      dispatch(setCurrentMessages(newMessages));
    }

    if (!chatId) throw new Error("No current chat ID");
    await updateCurrentChat(chatId, newMessages, dispatch, router, wsRef);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    dispatch(setIsLoading(false));
  }
};
