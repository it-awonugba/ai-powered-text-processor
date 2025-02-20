import {
  addMessage,
  ChatState,
  detectLanguage,
  Message,
  setError,
  summarizeMessage,
  translateMessage,
} from "../redux/reducers/chatSlice";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../redux/store";
import { SendHorizontal } from "lucide-react";

export default function Chat() {
  const [input, setInput] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("en");
  const dispatch = useDispatch<AppDispatch>();
  const chat = useSelector((state: { chat: ChatState }) => state.chat);

  const chatOutputRef = useRef<HTMLDivElement>(null);

  const { messages, error } = chat;
  const allMessages = messages.map((msg) => msg.text).join(" ");

  useEffect(() => {
    if (chatOutputRef.current) {
      chatOutputRef.current.scrollTop = chatOutputRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) {
      dispatch(setError("Input text cannot be empty, type a text please"));
      return;
    }

    const newMessage: Message = { id: Date.now(), text: input };

    dispatch(addMessage(newMessage));
    dispatch(detectLanguage(newMessage));
    if (chat.language === "en" && allMessages.length > 150) {
      dispatch(summarizeMessage(allMessages));
    }
    dispatch(setError(""));
    setInput("");
  };

  const handleSetLanaguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetLanguage(e.target.value);
  };

  const handleTranslate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatch(translateMessage(allMessages, chat.language!, targetLanguage));
  };

  const handleSummarize = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (chat.language !== "en") {
      dispatch(setError("Language must be english to summarize"));
      return;
    }

    dispatch(summarizeMessage(allMessages));
  };

  return (
    <section className="chat-container">
      <div className="chat">
        <div className="chat-output" ref={chatOutputRef} aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className="message">
              <p>{msg.text}</p>
            </div>
          ))}
          <div className="ai-messages">
            {chat.language && (
              <p className="language">Language: {chat.language}</p>
            )}
            {chat.summary && <p>Summary: {chat.summary}</p>}
            {chat.translation && (
              <p className="translation">Translation: {chat.translation}</p>
            )}
          </div>
        </div>
        {error && <p className="error">{error}</p>}

        <div className="chat-controls">
          <span className="language"> Language: {chat.language}</span>

          <select
            value={targetLanguage}
            onChange={handleSetLanaguage}
            aria-label="Select language"
          >
            <option value="en">English</option>
            <option value="pt">Portuguese</option>
            <option value="es">Spanish</option>
            <option value="ru">Russian</option>
            <option value="tr">Turkish</option>
            <option value="fr">French</option>
          </select>
          <button onClick={handleTranslate} aria-label="Translate chat text">
            Translate
          </button>
          {allMessages.length > 150 && (
            <button onClick={handleSummarize} aria-label="Summarize chat text">
              Summarize
            </button>
          )}
        </div>
      </div>
      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your text here..."
          aria-label="Chat input"
        />
        <button onClick={handleSend} aria-label="Send message">
          <SendHorizontal size={24} arial-label="send button icon" />
        </button>
      </div>
    </section>
  );
}
