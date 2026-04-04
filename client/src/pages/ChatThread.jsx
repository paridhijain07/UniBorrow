// import { useEffect, useRef, useState } from "react";
// import { useParams } from "react-router-dom";
// import { getThread, sendMessage } from "../api/messages.api";
// import { useAuth } from "../context/AuthContext";

// const ChatThread = () => {
//   const { userId } = useParams();
//   const { user } = useAuth();

//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");
//   const [otherUser, setOtherUser] = useState(null);
//   const [typing, setTyping] = useState(false);

//   const bottomRef = useRef();

//   // 🔄 Fetch messages
//   const fetchMessages = async () => {
//     try {
//       const res = await getThread(userId);
//       setMessages(res.messages || []);
//       setOtherUser(res.otherUser);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // 🔁 Polling (auto refresh)
//   useEffect(() => {
//     fetchMessages();

//     const interval = setInterval(fetchMessages, 3000);
//     return () => clearInterval(interval);
//   }, [userId]);

//   // ⬇ Auto scroll
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ✍ Typing indicator
//   const handleTyping = (e) => {
//     setText(e.target.value);
//     setTyping(true);

//     setTimeout(() => setTyping(false), 1000);
//   };

//   // 📤 Send message
//   const handleSend = async () => {
//     if (!text.trim()) return;

//     try {
//       await sendMessage({
//         receiverId: userId,
//         text,
//       });

//       setText("");
//       fetchMessages();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto h-[85vh] flex flex-col">

//       {/* 🔥 HEADER */}
//       <div className="p-4 border-b bg-white shadow flex items-center gap-3">
//         <img
//           src={otherUser?.avatar || "https://via.placeholder.com/40"}
//           className="w-10 h-10 rounded-full"
//         />
//         <div>
//           <div className="font-bold">{otherUser?.name}</div>
//           <div className="text-xs text-gray-500">
//             {typing ? "Typing..." : "Online"}
//           </div>
//         </div>
//       </div>

//       {/* 💬 MESSAGES */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">

//         {messages.map((msg) => {
//           const isMe = msg.sender === user.id;

//           return (
//             <div
//               key={msg._id}
//               className={`flex ${isMe ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`p-3 rounded-xl max-w-[70%] ${
//                   isMe
//                     ? "bg-orange-500 text-white"
//                     : "bg-white border"
//                 }`}
//               >
//                 <div>{msg.text}</div>

//                 <div className="text-[10px] mt-1 opacity-70 flex justify-end gap-1">
//                   {new Date(msg.timestamp).toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit",
//                   })}

//                   {isMe && (
//                     <span>
//                       {msg.read ? "✔✔" : "✔"}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         <div ref={bottomRef}></div>
//       </div>

//       {/* ✍ INPUT */}
//       <div className="p-3 border-t bg-white flex gap-2">
//         <input
//           value={text}
//           onChange={handleTyping}
//           placeholder="Type a message..."
//           className="flex-1 border rounded-xl px-3 py-2"
//         />

//         <button
//           onClick={handleSend}
//           className="bg-orange-500 text-white px-4 rounded-xl"
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatThread;

import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getThread, sendMessage } from "../api/messages.api";
import { useAuth } from "../context/AuthContext";

const ChatThread = () => {
  const { userId } = useParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [typing, setTyping] = useState(false);

  const bottomRef = useRef();

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
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = (e) => {
    setText(e.target.value);
    setTyping(true);
    setTimeout(() => setTyping(false), 1000);
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await sendMessage({
        receiverId: userId,
        text,
      });
      setText("");
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[85vh] flex flex-col">

      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md border border-white/40 p-4 rounded-t-2xl shadow flex items-center gap-3">
        <img
          src={otherUser?.avatar || "https://via.placeholder.com/40"}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-extrabold text-[#0f172a]">
            {otherUser?.name}
          </div>
          <div className="text-xs text-[#64748b]">
            {typing ? "Typing..." : "Online"}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-white to-[#f8fafc] border-x border-white/40">
        {messages.map((msg) => {
          const isMe = msg.sender === user.id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[70%] shadow-sm ${
                  isMe
                    ? "bg-[#f97316] text-white rounded-br-sm"
                    : "bg-white border border-white/40 text-[#0f172a] rounded-bl-sm"
                }`}
              >
                <div className="text-sm">{msg.text}</div>

                <div className="text-[10px] mt-1 flex justify-end gap-1 opacity-70">
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

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div className="bg-white/80 backdrop-blur-md border border-white/40 p-3 rounded-b-2xl flex gap-2">
        <input
          value={text}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 bg-white/60 border border-white/40 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#f97316]/40"
        />

        <button
          onClick={handleSend}
          className="bg-[#f97316] hover:bg-[#ea6c0a] text-white px-5 py-2 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatThread;