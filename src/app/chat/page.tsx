"use client";
import { useRef, useEffect, useLayoutEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIsMobileMenuOpen, setMessagesContainerMeasurements } from "@/store/slices/uiSlice";
import ChatHistory from "./components/ChatHistory";
import LoginStatus from "./components/LoginStatus";
import styles from "./chat.module.css";
import IconsProvider from "../components/iconsProvider";
import Messages from "./components/Messages";

export default function ChatPage() {
  const dispatch = useAppDispatch();
  const { isNewChat, currentMessages } = useAppSelector(
    (state) => state.chat
  );
  const { isMobileMenuOpen } = useAppSelector((state) => state.ui);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);


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
              <Messages />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
