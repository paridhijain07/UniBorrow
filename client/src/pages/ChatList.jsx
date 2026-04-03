import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConversations } from "../api/messages.api";

const ChatList = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="p-6">Loading chats...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-extrabold mb-4">Chats</h1>

      {conversations.length === 0 ? (
        <div>No conversations yet</div>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <div
              key={c.otherUser._id}
              onClick={() => navigate(`/chat/${c.otherUser._id}`)}
              className="p-4 bg-white/80 rounded-xl cursor-pointer hover:shadow"
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-bold">
                    {c.otherUser.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {c.lastMessage.text}
                  </div>
                </div>

                {c.unreadCount > 0 && (
                  <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;