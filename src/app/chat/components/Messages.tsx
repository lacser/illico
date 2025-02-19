"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrentMessages } from "@/store/slices/chatSlice";
import styles from "./Messages.module.css";
import MessageContent from "./MessageContent";
import MessageCopyButton from "./MessageCopyButton";
import MessageEditButton from "./MessageEditButton";
import { Message } from "../../../types";

export default function Messages() {
  const dispatch = useAppDispatch();
  const { chats, currentChatId, isNewChat, currentMessages } = useAppSelector(
    (state) => state.chat
  );

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

  if (!currentMessages.length || isNewChat) {
    return null;
  }

  return (
    <div className={styles.messages}>
      {currentMessages.map((msg: Message, index: number) => (
        <div
          key={index}
          className={`${styles.message} ${styles[msg.role]}`}
        >
          {msg.role === 'user' && (
            <div className={styles.messageActions}>
              <MessageCopyButton messageContent={msg.content} />
              <MessageEditButton />
            </div>
          )}
          <div className={styles.messageBubble}>
            <MessageContent
              content={msg.content}
              isComplete={msg.isComplete}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
