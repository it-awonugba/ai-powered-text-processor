import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../store";

export interface Message {
  id: number;
  text: string;
  language?: string;
  summary?: string;
  translation?: string;
}

export interface ChatState {
  messages: Message[];
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
  },
});

export const { addMessage, updateMessage } = chatSlice.actions;

export const detectLanguage =
  (message: Message): AppThunk =>
  async (dispatch) => {
    const capabilities = await ai.languageDetector.capabilities();
    const isDetectCapabilityAvailable = capabilities.available;
    let detector;
    let result;

    if (isDetectCapabilityAvailable === "no") {
      throw new Error(
        "Language Detection API is not supported in this browser."
      );
    }
    if (isDetectCapabilityAvailable === "readily") {
      detector = await ai.languageDetector.create();
      result = await detector.detect(message.text);
      dispatch(
        updateMessage({ ...message, language: result.detectedLanguage })
      );
    } else {
      detector = await ai.languageDetector.create();
      await detector.ready;
      result = await detector.detect(message.text);
      dispatch(
        updateMessage({ ...message, language: result[0].detectedLanguage })
      );
    }

    dispatch(translateMessage(message, result[0].detectedLanguage, "fr"));
  };

export const translateMessage =
  (
    message: Message,
    sourceLanguage: string,
    targetLanguage: string
  ): AppThunk =>
  async (dispatch) => {
    const capabilities = await ai.translator.capabilities();
    const isTranslationCapable = capabilities.available;
    if (!isTranslationCapable) {
      throw new Error("Translation API is not supported in this browser.");
    }
    const isTranslateCapabilityAvailable = capabilities.languagePairAvailable(
      sourceLanguage,
      targetLanguage
    );
    let translator;
    if (isTranslateCapabilityAvailable === "no") {
      throw new Error("Source and target language pair are not supported yet.");
    }
    if (isTranslateCapabilityAvailable === "readily") {
      translator = await ai.translator.create({
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
      });
      const result = await translator.translate(message.text);

      dispatch(updateMessage({ ...message, translation: result }));
    }
  };

export const summarizeMessage = (
  message: Message,
  options: SummarizerOptions
): AppThunk => {
  return async (dispatch) => {
    const capabilities = await ai.summarizer.capabilities();
    const canSummarize = capabilities.available;
    let summarizer;
    let result;
    if (canSummarize === "no") {
      throw new Error("Summarization API is not supported in this browser.");
    }
    if (canSummarize === "readily") {
      summarizer = await ai.summarizer.create();
      result = await summarizer.summarize(message.text);
      dispatch(updateMessage({ ...message, summary: result }));
    } else {
      summarizer = await ai.summarizer.create();
      await summarizer.ready;
      result = await summarizer.summarize(message.text);
      dispatch(updateMessage({ ...message, summary: result }));
    }
  };
};
export default chatSlice.reducer;
