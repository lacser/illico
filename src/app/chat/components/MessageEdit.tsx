import React from 'react';
import styles from './MessageEdit.module.css';
import IconsProvider from '@/app/components/iconsProvider';

interface MessageEditProps {
  content: string;
  onFinish: () => void;
}

const MessageEdit: React.FC<MessageEditProps> = ({ content: initialContent, onFinish }) => {
  const [content, setContent] = React.useState(initialContent);

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleSend = () => {
    if (content.trim()) {
      // TODO: Implement send logic here
    }
    onFinish();
  };

  const handleCancel = () => {
    onFinish();
  };

  return (
    <div className={styles.container}>
      <textarea
        className={styles.textarea}
        value={content}
        onChange={handleTextareaChange}
        placeholder="Edit message..."
      />
      <div className={styles.buttons}>
        <button 
          className={`${styles.button} ${styles.cancelButton}`}
          onClick={handleCancel}
          aria-label="Cancel"
        >
          <IconsProvider>close</IconsProvider>
          Cancel
        </button>
        <button 
          className={`${styles.button} ${styles.sendButton}`}
          onClick={handleSend}
          aria-label="Send"
        >
          <IconsProvider>arrow_upward</IconsProvider>
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageEdit;
