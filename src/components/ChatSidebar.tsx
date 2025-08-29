"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useEffect } from "react";

interface ChatSidebarProps {
  messages: string[];
  messageInput: string;
  setMessageInput: (msg: string) => void;
  sendMessage: () => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  newMessage: boolean;
}

export default function ChatSidebar({
  messages,
  messageInput,
  setMessageInput,
  sendMessage,
  chatOpen,
  setChatOpen,
  newMessage,
}: ChatSidebarProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-xl md:hidden hover:bg-indigo-700 transition z-50 relative"
      >
        💬
        {newMessage && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-80 max-w-xs bg-white border-l border-gray-300 p-4 shadow-2xl z-40 flex flex-col md:relative md:translate-x-0 md:w-80 md:shadow-none"
          >
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-indigo-700 text-center md:text-left">
              Room Chat
            </h2>

            <div className="flex-1 overflow-y-auto mb-2 space-y-2 p-2 bg-indigo-50 rounded-lg shadow-inner">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`p-2 rounded-lg break-words max-w-xs ${
                    msg.startsWith("You")
                      ? "bg-indigo-100 text-indigo-900 self-end"
                      : msg.startsWith("System")
                      ? "bg-gray-200 text-gray-700 self-center"
                      : "bg-indigo-200 text-indigo-900 self-start"
                  }`}
                >
                  {msg}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex flex-col mt-2 gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none text-gray-800 w-full"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition w-full"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
