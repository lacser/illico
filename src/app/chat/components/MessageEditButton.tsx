"use client";
import styles from "./MessageCopyButton.module.css"; // Reusing the same CSS module since it has the same styles
import IconsProvider from "../../components/iconsProvider";

interface MessageEditButtonProps {
  onClick?: () => void;
}

export default function MessageEditButton({ onClick }: MessageEditButtonProps) {
  return (
    <button 
      className={styles.messageAction} 
      aria-label="Edit message"
      data-tooltip="Edit message"
      onClick={onClick}
    >
      <IconsProvider iconSize="20px">
        edit
      </IconsProvider>
    </button>
  );
}
