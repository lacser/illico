"use client";
import { ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import ChatInput from "./components/ChatInput";
interface ChatLayoutProps {
  children: ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const { currentMessages, isNewChat } = useAppSelector((state) => state.chat);
  const { messagesContainerMeasurements } = useAppSelector((state) => state.ui);

  let showCenteredInput = !currentMessages.length || isNewChat;
  let computedWidth = 300;
  let bottom = "3rem";

  const getInputStyle = () => {
    if (!messagesContainerMeasurements) return {};

    const { left, width } = messagesContainerMeasurements;
    const screenWidth = window.innerWidth;
    const remValue = parseFloat(getComputedStyle(document.documentElement).fontSize);

    if (screenWidth < 480) {
      showCenteredInput = false;
      bottom = "1rem";
      computedWidth = width - remValue*2;
    } else if (screenWidth < 768) {
      bottom = "1rem";
      computedWidth = width - remValue*2;
    } else {
      bottom = "calc(1.5rem + 15px)";
      computedWidth = width - remValue*3;
    }

    const containerCenter = left + width / 2;
    const inputLeft = containerCenter - computedWidth / 2;

    return {
      position: "fixed",
      left: `${inputLeft}px`,
      width: `${computedWidth}px`,
      zIndex: 1,
      transition: "all 0.5s ease",
      bottom,
      ...(showCenteredInput
        ? {
            transform: "translateY(calc(-50vh + 10rem))",
          }
        : {
            transform: "none",
          }),
    };
  };

  return (
    <>
      {children}
      {messagesContainerMeasurements && (
        <div style={getInputStyle()}>
          <ChatInput showShadow={!showCenteredInput} />
        </div>
      )}
    </>
  );
}
