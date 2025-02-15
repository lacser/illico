import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface ChatState {
  isLoading: boolean;
  isNewChat: boolean;
  currentChatId: string | null;
  chats: Chat[];
}

const initialState: ChatState = {
  isLoading: false,
  isNewChat: false,
  currentChatId: null,
  chats: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setIsNewChat: (state, action: PayloadAction<boolean>) => {
      state.isNewChat = action.payload;
    },
    setCurrentChatId: (state, action: PayloadAction<string | null>) => {
      state.currentChatId = action.payload;
    },
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    addChat: (state, action: PayloadAction<Chat>) => {
      state.chats = [action.payload, ...state.chats];
    },
    updateChat: (state, action: PayloadAction<Chat>) => {
      state.chats = state.chats.map(chat => 
        chat._id === action.payload._id ? action.payload : chat
      );
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      state.chats = state.chats.filter(chat => chat._id !== action.payload);
    },
  },
});

export const {
  setIsLoading,
  setIsNewChat,
  setCurrentChatId,
  setChats,
  addChat,
  updateChat,
  deleteChat,
} = chatSlice.actions;

export default chatSlice.reducer;
