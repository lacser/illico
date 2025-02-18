"use client";
import { useState, useRef } from "react";
import styles from "./ChatInput.module.css";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import IconsProvider from "../../components/iconsProvider";
import { handleSubmit } from "../utils/chatActions";

interface ChatInputProps {
  showShadow?: boolean;
  display?: boolean;
}

export default function ChatInput({
  showShadow,
  display = true,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dispatch = useAppDispatch();
  const { isLoading, currentChatId, isNewChat, currentMessages } = useAppSelector(
    (state) => state.chat
  );
  const router = useRouter();

  if (!display) return null;

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = inputRef.current;
    if (textarea) {
      const htmlElement = document.documentElement;
      const fontSize = window.getComputedStyle(htmlElement).fontSize;
      const REM = parseFloat(fontSize);

      textarea.style.height = "auto";
      if (textarea.scrollHeight > 10 * REM) {
        textarea.style.height = `${10 * REM}px`;
        textarea.style.margin = "0";
        textarea.style.overflow = "auto";
      } else {
        textarea.style.height = `${textarea.scrollHeight}px`;
        textarea.style.margin = "0.4rem 0.4rem 0";
        textarea.style.overflow = "hidden";
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    handleSubmit(
      input.trim(),
      isLoading,
      currentChatId,
      isNewChat,
      currentMessages,
      dispatch,
      router
    );
    setInput("");
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.inputForm}>
      <div className={`${styles.inputWrapper} ${showShadow ? styles.showShadow : ""}`}>
        <textarea
          wrap="hard"
          ref={inputRef}
          rows={2}
          value={input}
          onChange={handleInput}
          placeholder="Send a message"
          className={styles.chatInput}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isLoading || !input.trim()}
        >
          <IconsProvider iconSize="24px" fill={0} grade={0} weight={400}>
            arrow_upward
          </IconsProvider>
        </button>
      </div>
    </form>
  );
}
