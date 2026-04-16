import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRequests, getReceivedRequests } from "../api/bookings.api";
import { getNotifications } from '../api/notfications.api'

const Dashboard = () => {
  const navigate = useNavigate();
  const [myBookings, setMyBookings] = useState([]);
  const [received, setReceived] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mine, rec, notif] = await Promise.all([
          getMyRequests(),
          getReceivedRequests(),
          getNotifications(),
        ]);

        setMyBookings(mine.bookings || []);
        setReceived(rec.bookings || []);
        setNotifications(notif.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeBorrows = myBookings.filter(b => b.status === "approved");
  const lentItems = received.filter(b => b.status === "approved");

  const isOverdue = (b) => {
    return b.status === "approved" && new Date(b.endDate) < new Date();
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-[#0f172a] dark:text-[#f4f4f5]">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 bg-white dark:bg-[#1e1e1e] border border-[#f97316]/50 rounded-xl font-semibold text-[#f97316] hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
          >
            All Bookings
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="px-4 py-2 bg-[#f97316] text-white rounded-xl font-semibold hover:bg-[#ea6c0a] transition-colors shadow-sm"
          >
            Messages
          </button>
        </div>
      </div>

      {/* 🔥 STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-xl shadow border border-transparent dark:border-[#2d2d2d]">
          <div className="text-gray-500 dark:text-[#a1a1aa]">My Borrows</div>
          <div className="text-2xl font-bold">{activeBorrows.length}</div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-xl shadow border border-transparent dark:border-[#2d2d2d]">
          <div className="text-gray-500 dark:text-[#a1a1aa]">Items Lent</div>
          <div className="text-2xl font-bold">{lentItems.length}</div>
        </div>

        <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-xl shadow border border-transparent dark:border-[#2d2d2d]">
          <div className="text-gray-500 dark:text-[#a1a1aa]">Notifications</div>
          <div className="text-2xl font-bold">{notifications.length}</div>
        </div>
      </div>

      {/* 🔥 ACTIVE BOOKINGS */}
      <div>
        <h2 className="text-xl font-bold mb-3 dark:text-[#f4f4f5]">Active Bookings</h2>

        {activeBorrows.length === 0 ? (
          <div className="text-gray-500 dark:text-[#a1a1aa]">No active bookings</div>
        ) : (
          activeBorrows.map((b) => (
            <div
              key={b._id}
              className={`p-4 mb-2 rounded border border-transparent dark:border-[#2d2d2d] ${
                isOverdue(b) ? "bg-red-100 dark:bg-red-900/30" : "bg-white dark:bg-[#1e1e1e]"
              }`}
            >
              <div className="font-semibold">{b.item?.title}</div>
              <div className="dark:text-[#d4d4d8]">End: {new Date(b.endDate).toDateString()}</div>

              {isOverdue(b) && (
                <div className="text-red-600 dark:text-red-400 font-bold">
                  ⚠ Overdue
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 🔥 MY LISTINGS (RECEIVED BOOKINGS) */}
      <div>
        <h2 className="text-xl font-bold mb-3 dark:text-[#f4f4f5]">Requests on My Items</h2>

        {received.length === 0 ? (
          <div className="text-gray-500 dark:text-[#a1a1aa]">No requests yet</div>
        ) : (
          received.map((b) => (
            <div key={b._id} className="p-4 mb-2 bg-white dark:bg-[#1e1e1e] rounded shadow border border-transparent dark:border-[#2d2d2d]">
              <div className="font-semibold">{b.item?.title}</div>
              <div className="dark:text-[#d4d4d8]">Borrower: {b.borrower?.name}</div>
              <div className="dark:text-[#d4d4d8]">Status: {b.status}</div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 NOTIFICATIONS PREVIEW */}
      <div>
        <h2 className="text-xl font-bold mb-3 dark:text-[#f4f4f5]">Recent Notifications</h2>

        {notifications.slice(0, 5).map((n) => (
          <div key={n._id} className="p-3 bg-white dark:bg-[#1e1e1e] mb-2 rounded shadow border border-transparent dark:border-[#2d2d2d] dark:text-[#e4e4e7]">
            {n.message}
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;