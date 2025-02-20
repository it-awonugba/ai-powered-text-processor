import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../store";
import { detect, summarize, translate } from "../../ai-services/ai-services";

export interface Message {
  id: number;
  text: string;
}

export interface ChatState {
  messages: Message[];
  error?: string;
  language?: string;
  summary?: string;
  translation?: string;
}

export interface SummarizerOptions {
  type: string;
  format: string;
  length: string;
}

const chatSlice = createSlice({
  name: "chat",
  initialState: { messages: [] } as ChatState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },

    updateMessage: (state, action: PayloadAction<Message>) => {
      const index = state.messages.findIndex(
        (msg) => msg.id === action.payload.id
      );
      if (index !== -1) {
        state.messages[index] = { ...state.messages[index], ...action.payload };
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setTranslation: (state, action: PayloadAction<string>) => {
      state.translation = action.payload;
    },
    setSummary: (state, action: PayloadAction<string>) => {
      state.summary = action.payload;
    },
  },
});

export const {
  addMessage,
  updateMessage,
  setLanguage,
  setTranslation,
  setSummary,
  setError,
} = chatSlice.actions;

export const detectLanguage =
  (message: Message): AppThunk =>
  async (dispatch) => {
    try {
      const result = await detect(message.text);
      dispatch(setLanguage(result));
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };

export const translateMessage =
  (text: string, sourceLanaguage: string, targetLanguage: string): AppThunk =>
  async (dispatch) => {
    try {
      const result = await translate(text, sourceLanaguage, targetLanguage);
      dispatch(setTranslation(result!));
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };

export const summarizeMessage = (text: string): AppThunk => {
  return async (dispatch) => {
    try {
      const options: SummarizerOptions = {
        type: "key-points",
        format: "markdown",
        length: "medium",
      };
      const result = await summarize(text, options);
      dispatch(setSummary(result));
    } catch (error) {
      dispatch(setError((error as Error).message));
    }
  };
};

export default chatSlice.reducer;
