"use client";
import { useState, useRef } from "react";
import styles from "./ChatInput.module.css";
import { useAppSelector } from "@/store/hooks";
import IconsProvider from "../../components/iconsProvider";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  hasBottomShadow?: boolean;
}

export default function ChatInput({
  onSubmit,
  hasBottomShadow,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isLoading } = useAppSelector((state) => state.chat);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = inputRef.current;
    if (textarea) {
      const htmlElement = document.documentElement;
      const fontSize = window.getComputedStyle(htmlElement).fontSize;
      const REM = parseFloat(fontSize);

      textarea.style.height = "auto";
      textarea.style.height = `${
        textarea.scrollHeight > 5.6 * REM ? 5.6 * REM : textarea.scrollHeight
      }px`;

      if (textarea.scrollHeight >= 6 * REM) {
        textarea.style.overflow = "auto";
      } else {
        textarea.style.overflow = "hidden";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputForm}>
      <div className={styles.inputWrapper}>
        <textarea
          wrap="hard"
          ref={inputRef}
          rows={2}
          value={input}
          onChange={handleInput}
          placeholder="Send a message"
          className={`${styles.chatInput} ${
            hasBottomShadow ? styles.bottomShadow : ""
          }`}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.sendButton}
          disabled={isLoading}
        >
          <IconsProvider iconSize="24px" fill={0} grade={0} weight={400}>
            arrow_upward
          </IconsProvider>
        </button>
      </div>
    </form>
  );
}
