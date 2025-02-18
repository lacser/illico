"use client";
import { useCallback, useEffect } from "react";
import Styles from "./ChatHistory.module.css";
import IconsProvider from "../../components/iconsProvider";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { handleDeleteChat } from "../utils/handleDeleteChat";
import {
  setIsNewChat,
  setCurrentChatId,
  setCurrentMessages,
  setChats,
} from "@/store/slices/chatSlice";
import { setIsMobileMenuOpen } from "@/store/slices/uiSlice";
import { Chat } from "../../../types";

export default function ChatHistory() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentChatId = useAppSelector((state) => state.chat.currentChatId);
  const chats = useAppSelector((state) => state.chat.chats);
  const isNewChat = useAppSelector((state) => state.chat.isNewChat);

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
    loadChats();
  }, [loadChats]);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    await handleDeleteChat(chatId, currentChatId, chats, dispatch, router);
  };

  const handleChatSelect = (chat: Chat) => {
    dispatch(setCurrentChatId(chat._id));
    dispatch(setIsNewChat(false));
    dispatch(
      setCurrentMessages(
        chat.messages.map((msg) => ({ ...msg, isComplete: true }))
      )
    );
    dispatch(setIsMobileMenuOpen(false));
  };

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null));
    dispatch(setIsNewChat(true));
    dispatch(setCurrentMessages([]));
    dispatch(setIsMobileMenuOpen(false));
  };

  return (
    <div className={Styles.chatHistory}>
      <div className={Styles.sidePanelOptionsContainer}>
        <button onClick={handleNewChat} className={Styles.newChatButton}>
          <IconsProvider
            iconSize="24px"
            fill={0}
            grade={0}
            weight={400}
            color="var(--md-sys-color-outline)"
          >
            maps_ugc
          </IconsProvider>
        </button>
      </div>

      <div className={Styles.chatList}>
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`${Styles.chatItem} ${
              chat._id === currentChatId ? Styles.active : ""
            }`}
          >
            <button
              onClick={() => handleChatSelect(chat)}
              className={Styles.chatButton}
            >
              <div className={Styles.chatTitle}>{chat.title}</div>
            </button>
            <button
              onClick={(e) => handleDelete(e, chat._id)}
              className={Styles.deleteButton}
              title="Delete chat"
            >
              <IconsProvider
                iconSize="20px"
                fill={0}
                grade={0}
                weight={400}
                classname={Styles.deleteIcon}
              >
                delete
              </IconsProvider>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
