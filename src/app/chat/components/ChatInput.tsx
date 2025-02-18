"use client";
import { useState, useRef } from "react";
import styles from "./ChatInput.module.css";
import { useAppSelector } from "@/store/hooks";
import IconsProvider from "../../components/iconsProvider";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  showShadow?: boolean;
}

export default function ChatInput({
  onSubmit,
  showShadow,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim());
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputForm}>
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
