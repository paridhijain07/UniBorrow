import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import { useBookingActions, useMyRequests, useReceivedRequests } from "../hooks/useBookings.js";
import ReviewForm from "../components/uniborrow/ReviewForm.jsx";

const StatusBadge = ({ status }) => {
  const cls =
    status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : status === "approved"
        ? "bg-green-100 text-green-700"
        : status === "rejected"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-600";
  return (
    <span className={"px-3 py-1 rounded-full text-xs font-extrabold border " + cls}>
      {status}
    </span>
  );
};

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString();
};

const isOverdue = (booking) => {
  if (!booking) return false;
  const now = Date.now();
  const end = booking.endDate ? new Date(booking.endDate).getTime() : null;
  return booking.status === "approved" && end !== null && end < now;
};

const Bookings = () => {
  useAuth(); // just to ensure protected pages redirect via PrivateRoute

  const [tab, setTab] = useState("received"); // received | mine
  const { data: received, loading: loadingReceived, error: errReceived, refetch: refetchReceived } =
    useReceivedRequests();
  const { data: myRequests, loading: loadingMine, error: errMine, refetch: refetchMine } =
    useMyRequests();

  const { approve, reject, returnBooking, pending: actionPending } = useBookingActions();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);

  const reviewEligible = useMemo(() => {
    // For MVP: only allow leaving review from "My Borrow Requests" tab cards.
    if (!reviewBookingId) return false;
    return true;
  }, [reviewBookingId]);

  const openReview = (booking) => {
    if (!booking) return;
    if (booking.status !== "returned") return;
    if (booking.reviewLeft) return;
    setReviewBookingId(booking._id);
    setReviewModalOpen(true);
  };

  const handleApprove = async (booking) => {
    try {
      await approve(booking._id);
      toast.success("Booking approved");
      await refetchReceived();
      await refetchMine();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed");
    }
  };

  const handleReject = async (booking) => {
    try {
      await reject(booking._id);
      toast.success("Booking rejected");
      await refetchReceived();
      await refetchMine();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed");
    }
  };

  const handleReturn = async (booking) => {
    try {
      await returnBooking(booking._id);
      toast.success("Marked as returned");
      await refetchReceived();
      await refetchMine();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed");
    }
  };

  const list = tab === "received" ? received : myRequests;
  const loading = tab === "received" ? loadingReceived : loadingMine;
  const error = tab === "received" ? errReceived : errMine;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 w-full">
      <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-md p-4">
        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setTab("received")}
            className={
              "px-5 py-3 rounded-xl font-extrabold border transition-all duration-200 " +
              (tab === "received"
                ? "bg-[#f97316] text-white border-[#f97316]"
                : "bg-white/60 text-[#0f172a] border-white/40 hover:bg-white/80")
            }
          >
            Requests I Received
          </button>
          <button
            type="button"
            onClick={() => setTab("mine")}
            className={
              "px-5 py-3 rounded-xl font-extrabold border transition-all duration-200 " +
              (tab === "mine"
                ? "bg-[#f97316] text-white border-[#f97316]"
                : "bg-white/60 text-[#0f172a] border-white/40 hover:bg-white/80")
            }
          >
            My Borrow Requests
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 font-semibold">
            {error}
          </div>
        )}

        <div className="mt-4">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/60 border border-white/40 rounded-2xl p-5 animate-pulse h-[200px]"
                />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="mt-4 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-6 text-[#64748b] font-semibold">
              {tab === "received"
                ? "No booking requests received yet."
                : "No borrow requests yet. Request an item from its detail page."}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {list.map((b) => {
                const item = b?.item;
                const borrower = b?.borrower;
                const owner = b?.owner;
                const overdue = isOverdue(b);

                return (
                  <div
                    key={b._id}
                    className={
                      "bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl p-5 shadow-md hover:scale-[1.02] hover:shadow-xl transition-all duration-200 " +
                      (overdue ? "ring-2 ring-[#ef4444]/40" : "")
                    }
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/40 bg-white/60 flex items-center justify-center">
                        {item?.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item?.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-[#64748b] font-semibold">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-extrabold text-[#0f172a] truncate">
                              {item?.title || "Item"}
                            </div>
                            <div className="text-sm text-[#64748b] font-semibold mt-1">
                              {tab === "received"
                                ? `Borrower: ${borrower?.name || "Student"}`
                                : `Owner: ${owner?.name || "Student"}`}
                            </div>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="text-xs text-[#64748b] font-semibold">
                            Start
                            <div className="mt-1 text-sm text-[#0f172a]">
                              {formatDate(b.startDate)}
                            </div>
                          </div>
                          <div className="text-xs text-[#64748b] font-semibold">
                            End
                            <div className="mt-1 text-sm text-[#0f172a]">
                              {formatDate(b.endDate)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs text-[#64748b] font-semibold">
                            Total Cost
                          </div>
                          <div className="text-lg font-extrabold text-[#0f172a] mt-1">
                            {item?.listingType === "Exchange" || item?.price === 0
                              ? "Free Exchange"
                              : (
                                <div className="flex items-center gap-2">
                                  <span>₹{b.totalCost ?? 0}</span>
                                  {b.penaltyAmount > 0 && (
                                    <span className="text-sm text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                      + ₹{b.penaltyAmount} Late Fee
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>

                        {overdue && (
                          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-3 text-sm font-semibold">
                            Overdue: Return required urgently.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {tab === "received" && (
                        <>
                          {b.status === "pending" && (
                            <>
                              <button
                                type="button"
                                disabled={actionPending}
                                onClick={() => handleApprove(b)}
                                className="bg-green-100 hover:bg-green-200 text-green-800 font-extrabold rounded-xl px-4 py-2 border border-green-200 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={actionPending}
                                onClick={() => handleReject(b)}
                                className="bg-red-100 hover:bg-red-200 text-red-800 font-extrabold rounded-xl px-4 py-2 border border-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {b.status === "approved" && (
                            <button
                              type="button"
                              disabled={actionPending}
                              onClick={() => handleReturn(b)}
                              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-extrabold rounded-xl px-4 py-2 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              Mark Returned
                            </button>
                          )}
                        </>
                      )}

                      {tab === "mine" && (
                        <>
                          {b.status === "returned" && !b.reviewLeft && (
                            <button
                              type="button"
                              disabled={actionPending}
                              onClick={() => openReview(b)}
                              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white font-extrabold rounded-xl px-4 py-2 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              Leave Review
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {reviewModalOpen && reviewBookingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-2xl">
            <div className="bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-[#0f172a]">
                  Submit Review
                </h3>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="text-[#0f172a] font-semibold"
                >
                  Close
                </button>
              </div>

              <div className="mt-4">
                <ReviewForm
                  bookingId={reviewBookingId}
                  onSuccess={async () => {
                    setReviewModalOpen(false);
                    await refetchMine();
                    await refetchReceived();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;

