'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Markdown from 'markdown-to-jsx';
import ChatHistory from './components/ChatHistory';
import LoginStatus from './components/LoginStatus';
import styles from './chat.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isComplete?: boolean;
}

interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

const MessageContent = ({ content, isComplete }: { content: string, isComplete?: boolean }) => {
  if (!isComplete) {
    return <div className={styles.streamingContent}>{content}</div>;
  }
  
  return (
    <Markdown options={{
      forceBlock: true,
      overrides: {
        code: {
          props: {
            className: styles.code
          }
        }
      }
    }}>
      {content}
    </Markdown>
  );
};

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewChat, setIsNewChat] = useState(false);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  const loadChats = useCallback(async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch chats');

      const data = await response.json();
      setChats(data);
      if (data.length > 0 && !currentChatId && !isNewChat) {
        setCurrentChatId(null);
        setCurrentMessages([]);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, [currentChatId, isNewChat, router]);

  useEffect(() => {
    if (!isNewChat && currentChatId) {
      const chat = chats.find(c => c._id === currentChatId);
      if (chat) {
        setCurrentMessages(chat.messages.map(msg => ({ ...msg, isComplete: true })));
      }
    }
  }, [currentChatId, chats, isNewChat]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleNewChat = () => {
    setCurrentChatId(null);
    setIsNewChat(true);
    setCurrentMessages([]);
  };

  const handleChatSelect = (chat: Chat) => {
    setCurrentChatId(chat._id);
    setIsNewChat(false);
    setCurrentMessages(chat.messages.map(msg => ({ ...msg, isComplete: true })));
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (!response.ok) throw new Error('Failed to delete chat');

      setChats(prev => prev.filter(chat => chat._id !== chatId));

      if (currentChatId === chatId) {
        const remainingChats = chats.filter(chat => chat._id !== chatId);
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0]._id);
          setCurrentMessages(remainingChats[0].messages.map(msg => ({ ...msg, isComplete: true })));
        } else {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const createNewChat = async (firstMessage: Message) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: firstMessage.content.substring(0, 30) + '...',
          messages: [firstMessage]
        }),
      });

      if (response.status === 401) {
        router.push('/login');
        return null;
      }
      if (!response.ok) throw new Error('Failed to create chat');

      const newChat = await response.json();
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat._id);
      setIsNewChat(false);
      setCurrentMessages([{ ...firstMessage, isComplete: true }]);
      return newChat._id;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  };

  const updateCurrentChat = async (chatId: string, messages: Message[]) => {
    if (!chatId) {
      console.error('No chat ID provided');
      return;
    }

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          title: messages[0]?.content.substring(0, 30) + '...' || 'New Chat'
        }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (!response.ok) throw new Error('Failed to update chat');

      const updatedChat = await response.json();
      setChats(prev => prev.map(chat =>
        chat._id === chatId ? updatedChat : chat
      ));
      setCurrentMessages(messages);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          chatId,
          message: messages[messages.length - 1]
        }));
      }
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      isComplete: true
    };

    setInput('');
    setIsLoading(true);

    try {
      let chatId = currentChatId;
      let updatedMessages: Message[] = [];

      if (isNewChat || !chatId) {
        chatId = await createNewChat(userMessage);
        if (!chatId) throw new Error('Failed to create new chat');
        updatedMessages = [userMessage];
      } else {
        if (!chatId) throw new Error('No current chat ID');
        updatedMessages = [...currentMessages, userMessage];
        await updateCurrentChat(chatId, updatedMessages);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        isComplete: false
      };

      let newMessages: Message[] = [...updatedMessages];
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          assistantMessage.isComplete = true;
          newMessages = [...updatedMessages, { ...assistantMessage }];
          setCurrentMessages(newMessages);
          break;
        }

        const text = new TextDecoder().decode(value);
        assistantMessage.content += text;

        newMessages = [...updatedMessages, { ...assistantMessage }];
        setCurrentMessages(newMessages);
      }

      if (!chatId) throw new Error('No current chat ID');
      await updateCurrentChat(chatId, newMessages);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.leftSidePanel}>
        <ChatHistory
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
        <LoginStatus />
      </div>

      <div className={styles.chatMain}>
        <div className={styles.messagesContainer}>
          <div className={styles.messagesWrapper}>
            {(!currentMessages.length || isNewChat) ? (
              <div>
                <h1 className={styles.emptyChat}>
                  What can I help with?
                </h1>
                <div className={styles.inputContainerMiddle} style={{ display: currentChatId ? 'none' : '' }}>
                  <form onSubmit={handleSubmit} className={styles.inputForm}>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message illico..."
                        className={styles.chatInput}
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={isLoading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--md-sys-color-on-tertiary-container)">
                          <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className={styles.messages}>
                {currentMessages.map((msg: Message, index: number) => (
                  <div
                    key={index}
                    className={`${styles.message} ${styles[msg.role]}`}
                  >
                    <div className={styles.messageBubble}>
                      <MessageContent content={msg.content} isComplete={msg.isComplete} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className={styles.inputContainerBottom} style={{ display: currentChatId ? '' : 'none' }}>
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message illico..."
                className={styles.chatInput}
                disabled={isLoading}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="var(--md-sys-color-on-tertiary-container)">
                  <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
