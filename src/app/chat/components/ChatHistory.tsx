'use client';
import Styles from './ChatHistory.module.css';

interface Message {
  role: 'user' | 'assistant';
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
  onDeleteChat
}: ChatHistoryProps) {
  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  return (
    <div className={Styles.chatHistory}>
      <div className={Styles.sidePanelOptionsContainer}>
        <button
          onClick={onNewChat}
          className={Styles.newChatButton}
        >
          <svg xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="var(--md-sys-color-outline)">
            <path d="m48-96 81-276q-16-36-24.5-75T96-528q0-80 30-149.5t82.5-122Q261-852 330.96-882t149.5-30q79.54 0 149.04 30 69.5 30 122 82.5T834-677.28q30 69.73 30 149Q864-449 834-379t-82.5 122.5Q699-204 629.5-174T480-144q-42 0-81-8.5T324-177L48-96Zm107-107 174-51q11 5 51 21.5T480-216q130 0 221-91t91-221q0-130-91-221t-221-91q-130 0-221 91t-91 221q0 60 16 99.5t22 51.5l-51 174Zm289-181h72v-108h108v-72H516v-108h-72v108H336v72h108v108Zm30-138Z" />
          </svg>
        </button>
      </div>

      <div className={Styles.chatList}>
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`${Styles.chatItem} ${chat._id === currentChatId ? Styles.active : ''}`}
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
              <svg xmlns="http://www.w3.org/2000/svg"
                height="18px"
                viewBox="0 -960 960 960"
                width="18px"
                className={Styles.deleteIcon}
              >
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
