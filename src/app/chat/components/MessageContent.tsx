import React from 'react';
import Markdown from 'markdown-to-jsx';
import styles from './MessageContent.module.css';

export default function MessageContent({
  content,
  isComplete,
}: {
  content: string;
  isComplete?: boolean;
}) {
  if (!isComplete) {
    return <div className={styles.streamingContent}>{content}</div>;
  }

  return (
    <div className={styles.content}>
      <Markdown
        options={{
          forceBlock: true
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
