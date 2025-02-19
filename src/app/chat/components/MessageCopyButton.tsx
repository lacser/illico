"use client";
import { useState } from "react";
import styles from "./MessageCopyButton.module.css";
import IconsProvider from "../../components/iconsProvider";

interface MessageCopyButtonProps {
  messageContent: string;
}

export default function MessageCopyButton({ messageContent }: MessageCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button 
      className={styles.messageAction} 
      aria-label="Copy message"
      data-tooltip={copied ? "Copied" : "Copy message"}
      onClick={handleCopy}
    >
      <IconsProvider iconSize="20px">
        {copied ? "done" : "content_copy"}
      </IconsProvider>
    </button>
  );
}
