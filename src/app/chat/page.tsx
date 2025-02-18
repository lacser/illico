"use client";
import { useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatInput from "./components/ChatInput";
import Markdown from "markdown-to-jsx";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setIsLoading,
  setIsNewChat,
  setCurrentChatId,
  setChats,
  addChat,
  updateChat,
  setCurrentMessages,
} from "@/store/slices/chatSlice";
import { setIsMobileMenuOpen } from "@/store/slices/uiSlice";
import ChatHistory from "./components/ChatHistory";
import LoginStatus from "./components/LoginStatus";
import styles from "./chat.module.css";
import IconsProvider from "../components/iconsProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
  isComplete?: boolean;
}

const MessageContent = ({
  content,
  isComplete,
}: {
  content: string;
  isComplete?: boolean;
}) => {
  if (!isComplete) {
    return <div className={styles.streamingContent}>{content}</div>;
  }

  return (
    <Markdown
      options={{
        forceBlock: true,
        overrides: {
          code: {
            props: {
              className: styles.code,
            },
          },
        },
      }}
    >
      {content}
    </Markdown>
  );
};

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { chats, currentChatId, isLoading, isNewChat, currentMessages } = useAppSelector(
    (state) => state.chat
  );
  const { isMobileMenuOpen } = useAppSelector((state) => state.ui);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  const loadChats = useCallback(async () => {
    try {
      const response = await fetch("/api/chats");
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch chats");

      const data = await response.json();
      dispatch(setChats(data));
      if (data.length > 0 && !currentChatId && !isNewChat) {
        dispatch(setCurrentChatId(null));
        dispatch(setCurrentMessages([]));
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    }
  }, [currentChatId, isNewChat, router, dispatch]);

  useEffect(() => {
    if (!isNewChat && currentChatId) {
      const chat = chats.find((c) => c._id === currentChatId);
      if (chat) {
        dispatch(setCurrentMessages(
          chat.messages.map((msg) => ({ ...msg, isComplete: true }))
        ));
      }
    }
  }, [currentChatId, chats, isNewChat, dispatch]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const createNewChat = async (firstMessage: Message) => {
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

  const updateCurrentChat = async (chatId: string, messages: Message[]) => {
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

  const handleSubmit = async (text: string) => {
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
        chatId = await createNewChat(userMessage);
        if (!chatId) throw new Error("Failed to create new chat");
        updatedMessages = [userMessage];
      } else {
        if (!chatId) throw new Error("No current chat ID");
        updatedMessages = [...currentMessages, userMessage];
        await updateCurrentChat(chatId, updatedMessages);
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
      await updateCurrentChat(chatId, newMessages);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return (
    <div className={styles.chatContainer}>
      <button
        className={styles.menuToggle}
        onClick={() => dispatch(setIsMobileMenuOpen(!isMobileMenuOpen))}
        aria-label="Toggle menu"
      >
        <IconsProvider iconSize="24px" fill={0} grade={0} weight={400}>
          menu
        </IconsProvider>
      </button>
      <div
        className={`${styles.leftSidePanel} ${
          isMobileMenuOpen ? styles.open : ""
        }`}
      >
        <ChatHistory
          chats={chats}
        />
        <LoginStatus />
      </div>

      <div className={styles.chatMain}>
        <div className={styles.messagesContainer}>
          <div className={styles.messagesWrapper}>
            {!currentMessages.length || isNewChat ? (
              <div>
                <h1 className={styles.emptyChat}>What can I help with?</h1>
                <div
                  className={styles.inputContainerMiddle}
                  style={{ display: currentChatId ? "none" : "" }}
                >
                  <ChatInput onSubmit={handleSubmit} />
                </div>
              </div>
            ) : (
              <div className={styles.messages}>
                {currentMessages.map((msg: Message, index: number) => (
                  <div
                    key={index}
                    className={`${styles.message} ${styles[msg.role]}`}
                  >
                    <div className={styles.messageBubble}>
                      <MessageContent
                        content={msg.content}
                        isComplete={msg.isComplete}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div
          className={styles.inputContainerBottom}
          style={{ display: currentChatId ? "" : "none" }}
        >
          <ChatInput onSubmit={handleSubmit} showShadow />
        </div>
      </div>
    </div>
  );
}
