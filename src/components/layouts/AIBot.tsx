import React, {
  useState,
  useRef,
  useEffect,
  FormEvent,
  ChangeEvent,
} from "react";
import { marked } from "marked"; // Import the marked library

// Define the types for your message objects
interface Message {
  sender: "You" | "AI";
  text: string;
}

// Define the type for messages sent to the backend
interface BackendMessage {
  type: "human" | "ai";
  content: string;
}

// Define the type for the API response
interface ChatApiResponse {
  response: string;
}

function AIBot(): JSX.Element {
  // Explicitly define the return type for the App component
  const [messages, setMessages] = useState<Message[]>([]); // Specify array of Message type
  const [input, setInput] = useState<string>(""); // Specify string type
  const [loading, setLoading] = useState<boolean>(false); // Specify boolean type
  const [error, setError] = useState<string | null>(null); // Specify string or null type

  const messagesEndRef = useRef<HTMLDivElement>(null); // Specify the type of the ref'd element

  // Effect to scroll to the bottom when messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]); // Add loading to dependencies to scroll when loader appears

  // Initial welcome message from AI
  useEffect(() => {
    setMessages([
      {
        sender: "AI",
        text: "Hello! I am your JBS AI Assistant. How can I help you today?",
      },
    ]);
  }, []); // Empty dependency array means this runs only once on mount

  const sendMessage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    // Specify type for form event and Promise return
    e.preventDefault(); // Prevent default form submission behavior

    const messageText = input.trim();
    if (!messageText) return; // Don't send empty messages

    // Add user message to state
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "You", text: messageText },
    ]);
    setInput(""); // Clear input field immediately

    // Set loading state and clear any previous errors
    setLoading(true);
    setError(null);

    // Add a temporary AI loading message bubble for visual feedback
    const loadingMessage: Message = {
      sender: "AI",
      text: '<div class="loading-dots"><span></span><span></span><span></span></div>',
    };
    setMessages((prevMessages) => [...prevMessages, loadingMessage]);

    try {
      // Prepare chat history for the backend
      const chatHistoryForBackend: BackendMessage[] = messages.map((msg) => ({
        type: msg.sender === "You" ? "human" : "ai",
        content: msg.text,
      }));

      // Make API call to your FastAPI backend
      const response = await fetch("http://127.0.0.1:8003/chat", {
        // Make sure this URL is correct for your FastAPI UI Backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: messageText,
          chat_history: chatHistoryForBackend, // Send the full chat history
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! Status: ${response.status}. Detail: ${
            errorData.detail || "Unknown error"
          }`
        );
      }

      const data: ChatApiResponse = await response.json(); // Type assertion for API response
      const aiResponseText = data.response;

      // Update messages: remove the loading message and add the actual AI response
      setMessages((prevMessages) => {
        const newMessages = prevMessages.slice(0, -1); // Remove the last (loading) message
        return [...newMessages, { sender: "AI", text: aiResponseText }];
      });
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(
        `Failed to get a response from the AI: ${errorMessage}. Please try again.`
      );

      // If there was an error, remove the loading message and also the user's last message if it wasn't processed
      setMessages((prevMessages) => {
        const newMessages = prevMessages.slice(0, -2); // Remove both the loading and the user's message
        return [...newMessages];
      });
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4 pr-8">
        JBS AI Assistant
      </h1>
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 bg-gray-50 rounded-lg p-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "You" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === "You"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 border"
              }`}
            >
              <div className="text-xs font-semibold mb-1 opacity-75">
                {msg.sender}:
              </div>
              {/* Render Markdown using dangerouslySetInnerHTML */}
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{
                  __html: marked.parse(msg.text, { async: false }) as string,
                }}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Element to scroll into view */}
      </div>

      {/* Error message display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default AIBot;
