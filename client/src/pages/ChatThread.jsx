import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { getThread, sendMessage } from "../api/messages.api";
import { useAuth } from "../hooks/useAuth.js";

// Ensure socket connects to the backend base URL (stripping out /api)
const SOCKET_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const ChatThread = () => {
  const { userId } = useParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  
  // Real-time states
  const [socket, setSocket] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef();
  const typingTimeoutRef = useRef(null);

  // Initial fetch
  const fetchMessages = async () => {
    try {
      const res = await getThread(userId);
      setMessages(res.messages || []);
      setOtherUser(res.otherUser);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  // Socket initialization
  useEffect(() => {
    if (!user?.id) return;

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Register presence
    newSocket.emit("register", user.id);

    // Initial online users fetch
    newSocket.emit("get_online_users", (onlineIds) => {
      if (onlineIds.includes(userId)) {
        setIsOnline(true);
      }
    });

    // Listeners
    newSocket.on("receive_private_message", (msg) => {
      if (msg.sender === userId || msg.receiver === userId) {
        setMessages((prev) => {
          // Prevent duplicates if API returned it first
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    newSocket.on("user_online", (uid) => {
      if (uid === userId) setIsOnline(true);
    });

    newSocket.on("user_offline", (uid) => {
      if (uid === userId) setIsOnline(false);
    });

    newSocket.on("user_typing", ({ senderId, isTyping: typingStatus }) => {
      if (senderId === userId) {
        setIsTyping(typingStatus);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = (e) => {
    setText(e.target.value);
    
    // Emit typing == true
    if (socket) {
      socket.emit("typing", { senderId: user.id, receiverId: userId, isTyping: true });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to cancel typing after 1.5s
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit("typing", { senderId: user.id, receiverId: userId, isTyping: false });
      }
    }, 1500);
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    const currentText = text;
    setText("");

    // Emit stop typing immediately
    if (socket) {
       socket.emit("typing", { senderId: user.id, receiverId: userId, isTyping: false });
       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    try {
      const res = await sendMessage({
        receiverId: userId,
        text: currentText,
      });
      // Add the message to the view immediately without waiting for fetch
      if (res?.message) {
         setMessages((prev) => [...prev, res.message]);
      } else {
         fetchMessages();
      }
    } catch (err) {
      console.error(err);
      setText(currentText); // Restore on error
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[85vh] flex flex-col p-4">

      {/* HEADER */}
      <div className="bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md border border-white/40 dark:border-[#3f3f46] p-4 rounded-t-3xl shadow-sm flex items-center gap-4 z-10 relative">
        <div className="relative">
          <img
            src={otherUser?.avatar || "/default-avatar.svg"}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
        </div>
        <div className="flex-1">
          <div className="font-extrabold text-[#0f172a] dark:text-[#f4f4f5] text-lg">
            {otherUser?.name || "Student"}
          </div>
          <div className="text-xs font-semibold text-[#64748b] dark:text-[#a1a1aa]">
             {isOnline ? "Active now" : "Offline"}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] dark:from-[#121212] dark:to-[#121212] border-x border-[#e2e8f0] dark:border-[#3f3f46]">
        
        {messages.length === 0 && (
           <div className="h-full flex items-center justify-center text-[#64748b] dark:text-[#a1a1aa] text-sm font-semibold opacity-70">
             No messages yet. Start the conversation!
           </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender === user.id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`px-5 py-2.5 max-w-[70%] shadow-sm flex flex-col ${
                  isMe
                    ? "bg-gradient-to-br from-[#f97316] to-[#ea6c0a] text-white rounded-2xl rounded-tr-sm"
                    : "bg-white dark:bg-[#1f1f22] border border-[#e2e8f0] dark:border-[#3f3f46] text-[#0f172a] dark:text-[#f4f4f5] rounded-2xl rounded-tl-sm"
                }`}
              >
                <div className="text-[15px] leading-relaxed break-words">{msg.text}</div>

                <div className="text-[10px] mt-1.5 flex justify-end gap-1 opacity-70 font-semibold tracking-wide">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMe && (
                    <span>{msg.read ? "✔✔" : "✔"}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300">
             <div className="bg-white dark:bg-[#1f1f22] border border-[#e2e8f0] dark:border-[#3f3f46] text-[#0f172a] dark:text-[#f4f4f5] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0ms"}}></div>
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "150ms"}}></div>
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "300ms"}}></div>
             </div>
          </div>
        )}

        <div ref={bottomRef} className="h-2"></div>
      </div>

      {/* INPUT */}
      <div className="bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-md border border-[#e2e8f0] dark:border-[#3f3f46] p-3 rounded-b-3xl flex gap-3 z-10 relative">
        <input
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          placeholder="Message..."
          className="flex-1 bg-[#f8fafc] dark:bg-[#1f1f22] border border-[#cbd5e1] rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-[#f97316]/50 transition-all font-medium text-[#0f172a] dark:text-[#f4f4f5]"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="bg-[#f97316] hover:bg-[#ea6c0a] disabled:opacity-50 disabled:hover:bg-[#f97316] disabled:cursor-not-allowed text-white px-6 py-3 rounded-2xl font-extrabold transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/30 flex items-center justify-center"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatThread;