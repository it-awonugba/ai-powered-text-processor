import {
  addMessage,
  ChatState,
  detectLanguage,
  Message,
} from "../redux/reducers/chatSlice";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../redux/store";

export default function Chat() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector(
    (state: { chat: ChatState }) => state.chat.messages
  );
  const chatOutputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOutputRef.current) {
      chatOutputRef.current.scrollTop = chatOutputRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessage: Message = { id: Date.now(), text: input };
    dispatch(addMessage(newMessage));
    setInput("");
    checkLanguage(newMessage);
  };

  const checkLanguage = async (message: Message) => {
    try {
      dispatch(detectLanguage(message));
    } catch (error) {
      console.error("Language detection error:", error);
    }
  };

  return (
    <section className="chat-container">
      <div className="chat-output" ref={chatOutputRef} aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <p>{msg.text}</p>
            {msg.language && (
              <p className="language">Detected: {msg.language}</p>
            )}
            {msg.translation && (
              <p className="translation">Translation: {msg.translation}</p>
            )}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your text here..."
          aria-label="Chat input"
        />
        <button onClick={handleSend} aria-label="Send message">
          ➤
        </button>
      </div>
    </section>
  );
}
