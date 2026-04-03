import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getThread, sendMessage } from "../api/messages.api";

const ChatThread = () => {
  const { userId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherUser, setOtherUser] = useState(null);

  const fetchMessages = async () => {
    try {
      const res = await getThread(userId);
      setMessages(res.messages);
      setOtherUser(res.otherUser);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [userId]);

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
    <div className="max-w-3xl mx-auto p-6 flex flex-col h-[80vh]">
      <h2 className="font-bold text-lg mb-3">
        Chat with {otherUser?.name}
      </h2>

      <div className="flex-1 overflow-y-auto space-y-2 border p-3 rounded">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded ${
              msg.sender === userId
                ? "bg-gray-200 text-left"
                : "bg-orange-200 text-right"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          className="flex-1 border p-2 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-orange-500 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatThread;