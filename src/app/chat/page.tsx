"use client";
import { useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCurrentChatId,
  setChats,
  setCurrentMessages,
} from "@/store/slices/chatSlice";
import { setIsMobileMenuOpen, setMessagesContainerMeasurements } from "@/store/slices/uiSlice";
import ChatHistory from "./components/ChatHistory";
import LoginStatus from "./components/LoginStatus";
import styles from "./chat.module.css";
import IconsProvider from "../components/iconsProvider";
import MessageContent from "./components/MessageContent";
import { Message } from "../../types";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { chats, currentChatId, isNewChat, currentMessages } = useAppSelector(
    (state) => state.chat
  );
  const { isMobileMenuOpen } = useAppSelector((state) => state.ui);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
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
        dispatch(
          setCurrentMessages(
            chat.messages.map((msg) => ({ ...msg, isComplete: true }))
          )
        );
      }
    }
  }, [currentChatId, chats, isNewChat, dispatch]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  useLayoutEffect(() => {
    if (!messagesContainerRef.current) return;

    const updateMeasurements = () => {
      const rect = messagesContainerRef.current?.getBoundingClientRect();
      if (rect) {
        dispatch(setMessagesContainerMeasurements({
          left: rect.left,
          width: rect.width,
        }));
      }
    };

    const resizeObserver = new ResizeObserver(updateMeasurements);
    resizeObserver.observe(messagesContainerRef.current);
    updateMeasurements();
    const messagesContainerRefCurrent = messagesContainerRef.current;

    return () => {
      if (messagesContainerRefCurrent) {
        resizeObserver.unobserve(messagesContainerRefCurrent);
      }
      resizeObserver.disconnect();
    };
  }, [dispatch]);

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
        <ChatHistory />
        <LoginStatus />
      </div>

      <div className={styles.chatMain}>
        <div ref={messagesContainerRef} className={styles.messagesContainer}>
          <div className={styles.messagesWrapper}>
            {!currentMessages.length || isNewChat ? (
              <div className={styles.homeInputContainer}>
                <h1 className={styles.emptyChat}>What can I help with?</h1>
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
      </div>
    </div>
  );
}
