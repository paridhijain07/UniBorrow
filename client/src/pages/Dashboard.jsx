import { useEffect, useState } from "react";
import { getMyRequests, getReceivedRequests } from "../api/bookings.api";
import { getNotifications } from '../api/notfications.api'

const Dashboard = () => {
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

      {/* 🔥 STATS */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-gray-500">My Borrows</div>
          <div className="text-2xl font-bold">{activeBorrows.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-gray-500">Items Lent</div>
          <div className="text-2xl font-bold">{lentItems.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-gray-500">Notifications</div>
          <div className="text-2xl font-bold">{notifications.length}</div>
        </div>
      </div>

      {/* 🔥 ACTIVE BOOKINGS */}
      <div>
        <h2 className="text-xl font-bold mb-3">Active Bookings</h2>

        {activeBorrows.length === 0 ? (
          <div>No active bookings</div>
        ) : (
          activeBorrows.map((b) => (
            <div
              key={b._id}
              className={`p-4 mb-2 rounded ${
                isOverdue(b) ? "bg-red-100" : "bg-white"
              }`}
            >
              <div className="font-semibold">{b.item?.title}</div>
              <div>End: {new Date(b.endDate).toDateString()}</div>

              {isOverdue(b) && (
                <div className="text-red-600 font-bold">
                  ⚠ Overdue
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 🔥 MY LISTINGS (RECEIVED BOOKINGS) */}
      <div>
        <h2 className="text-xl font-bold mb-3">Requests on My Items</h2>

        {received.length === 0 ? (
          <div>No requests yet</div>
        ) : (
          received.map((b) => (
            <div key={b._id} className="p-4 mb-2 bg-white rounded shadow">
              <div className="font-semibold">{b.item?.title}</div>
              <div>Borrower: {b.borrower?.name}</div>
              <div>Status: {b.status}</div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 NOTIFICATIONS PREVIEW */}
      <div>
        <h2 className="text-xl font-bold mb-3">Recent Notifications</h2>

        {notifications.slice(0, 5).map((n) => (
          <div key={n._id} className="p-3 bg-white mb-2 rounded shadow">
            {n.message}
          </div>
        ))}
      </div>

    </div>
  );
};

export default Dashboard;