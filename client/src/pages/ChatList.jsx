import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getConversations } from "../api/messages.api";
import { useAuth } from "../hooks/useAuth.js";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = rawApiUrl.replace(/\/api\/?$/, "");

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Online statuses set Map: Add uid mapping directly
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await getConversations();
        setConversations(res.conversations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Socket initialization for presence map only
  useEffect(() => {
    if (!user?.id) return;

    const newSocket = io(SOCKET_URL);
    
    newSocket.emit("register", user.id);

    newSocket.emit("get_online_users", (onlineIds) => {
      setOnlineUsers(new Set(onlineIds));
    });

    newSocket.on("user_online", (uid) => {
      setOnlineUsers((prev) => new Set(prev).add(uid));
    });

    newSocket.on("user_offline", (uid) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(uid);
        return updated;
      });
    });

    return () => newSocket.disconnect();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-8 w-44 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800/60 rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Messages</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Direct campus communication</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 p-12 rounded-3xl text-center shadow-sm">
          <div className="text-4xl mb-3">💬</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">No conversations yet</div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Find items in the browse catalog and message owners directly to arrange handovers!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => {
            const isOnline = onlineUsers.has(c.otherUser._id);
            return (
              <div
                key={c.otherUser._id}
                onClick={() => navigate(`/chat/${c.otherUser._id}`)}
                className="p-4 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl cursor-pointer hover:border-orange-500/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center gap-4 group"
              >
                <div className="relative shrink-0">
                  <img
                    src={c.otherUser.avatar || "/default-avatar.svg"}
                    alt={c.otherUser.name}
                    className="w-13 h-13 rounded-full object-cover border-2 border-slate-200 dark:border-slate-800 group-hover:scale-105 transition-transform"
                  />
                  <div
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#111827] transition-colors ${
                      isOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                    title={isOnline ? "Active now" : "Offline"}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 group-hover:text-orange-500 transition-colors">
                    <span className="truncate">{c.otherUser.name}</span>
                    {isOnline && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Online
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-sm truncate mt-0.5 ${
                      c.unreadCount > 0
                        ? "text-slate-900 dark:text-white font-bold"
                        : "text-slate-500 dark:text-slate-400 font-normal"
                    }`}
                  >
                    {c.lastMessage.sender === user.id ? "You: " : ""}
                    {c.lastMessage.text}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {new Date(c.lastMessage.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {c.unreadCount > 0 && (
                    <span className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm">
                      {c.unreadCount} NEW
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;