"use client";
import Styles from "./ChatHistory.module.css";
import IconsProvider from "../../components/iconsProvider";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface ChatHistoryProps {
  chats: Chat[];
  currentChatId: string | null;
  onChatSelect: (chat: Chat) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export default function ChatHistory({
  chats,
  currentChatId,
  onChatSelect,
  onNewChat,
  onDeleteChat,
}: ChatHistoryProps) {
  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  return (
    <div className={Styles.chatHistory}>
      <div className={Styles.sidePanelOptionsContainer}>
        <button onClick={onNewChat} className={Styles.newChatButton}>
          <IconsProvider iconSize="24px" fill={0} grade={0} weight={400} color="var(--md-sys-color-outline)">
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
              onClick={() => onChatSelect(chat)}
              className={Styles.chatButton}
            >
              <div className={Styles.chatTitle}>{chat.title}</div>
            </button>
            <button
              onClick={(e) => handleDelete(e, chat._id)}
              className={Styles.deleteButton}
              title="Delete chat"
            >
              <IconsProvider iconSize="18px" fill={0} grade={0} weight={400} classname={Styles.deleteIcon}>
                delete
              </IconsProvider>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
