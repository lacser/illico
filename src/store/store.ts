import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      chat: chatReducer,
      ui: uiReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const store = makeStore();
