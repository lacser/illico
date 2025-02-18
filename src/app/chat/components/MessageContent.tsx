import React, { useEffect } from "react";
import Markdown from "markdown-to-jsx";
import styles from "./MessageContent.module.css";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-python";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-powershell";

const Code = ({
  className,
  children,
}: {
  className?: string;
  children: string;
}) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [children]);

  const language = className ? className.replace("lang-", "") : "text";

  return <code className={`language-${language}`}>{children}</code>;
};

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
          forceBlock: true,
          overrides: {
            code: Code,
          },
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
