import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getThread, sendMessage } from "../api/messages.api";
import { useAuth } from "../hooks/useAuth.js";
import { ArrowLeft, Send } from "lucide-react";

// Ensure socket connects to the backend base URL (stripping out /api)
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = rawApiUrl.replace(/\/api\/?$/, "");

const ChatThread = () => {
  const navigate = useNavigate();
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
    <div className="max-w-3xl mx-auto h-[86vh] flex flex-col p-4">
      {/* HEADER */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 p-4 rounded-t-3xl shadow-sm flex items-center gap-3.5 z-10 relative">
        <button
          onClick={() => navigate("/messages")}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Back to messages"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="relative shrink-0">
          <img
            src={otherUser?.avatar || "/default-avatar.svg"}
            alt={otherUser?.name || "Student"}
            className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 dark:border-slate-800"
          />
          <div
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#111827] transition-colors ${
              isOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-slate-900 dark:text-white text-base truncate">
            {otherUser?.name || "Fellow Student"}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isOnline ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active now</span>
            ) : (
              "Offline"
            )}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3.5 bg-slate-50/70 dark:bg-[#0b0f19] border-x border-slate-200/80 dark:border-slate-800/80">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-medium">
            <div className="text-3xl mb-2">👋</div>
            <p>No messages yet. Say hello to arrange item pickup!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender === user.id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-200`}
            >
              <div
                className={`px-4 py-2.5 max-w-[75%] rounded-2xl shadow-sm flex flex-col text-sm leading-relaxed ${
                  isMe
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-tr-xs"
                    : "bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white rounded-tl-xs"
                }`}
              >
                <div className="break-words">{msg.text}</div>

                <div
                  className={`text-[10px] mt-1 flex justify-end gap-1 font-semibold ${
                    isMe ? "text-orange-100" : "text-slate-400"
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isMe && <span>{msg.read ? "✓✓" : "✓"}</span>}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-sm flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-1" />
      </div>

      {/* INPUT */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 p-3 rounded-b-3xl flex gap-2.5 z-10 relative shadow-sm">
        <input
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Type a message..."
          className="flex-1 bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl font-bold transition-all duration-200 shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 text-sm"
        >
          <span>Send</span>
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};

export default ChatThread;