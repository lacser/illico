import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ContainerMeasurements {
  left: number;
  width: number;
}

interface UiState {
  isMobileMenuOpen: boolean;
  messagesContainerMeasurements: ContainerMeasurements | null;
}

const initialState: UiState = {
  isMobileMenuOpen: false,
  messagesContainerMeasurements: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setMessagesContainerMeasurements: (state, action: PayloadAction<ContainerMeasurements>) => {
      state.messagesContainerMeasurements = action.payload;
    },
  },
});

export const { setIsMobileMenuOpen, setMessagesContainerMeasurements } = uiSlice.actions;

export default uiSlice.reducer;
