import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../hooks/useAuth.js";
import { useBookingActions, useMyRequests, useReceivedRequests } from "../hooks/useBookings.js";
import ReviewForm from "../components/uniborrow/ReviewForm.jsx";

const StatusBadge = ({ status }) => {
  const cls =
    status === "pending"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
      : status === "approved"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        : status === "rejected"
          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
          : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  return (
    <span className={"px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize " + cls}>
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
    <div className="max-w-6xl mx-auto px-4 py-8 w-full pb-16">
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setTab("received")}
            className={
              "px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer " +
              (tab === "received"
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700")
            }
          >
            Requests I Received
          </button>
          <button
            type="button"
            onClick={() => setTab("mine")}
            className={
              "px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer " +
              (tab === "mine"
                ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700")
            }
          >
            My Borrow Requests
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-2xl p-4 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-5 animate-pulse h-[200px]"
                />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
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
                      "bg-slate-50/70 dark:bg-slate-800/40 border rounded-2xl p-5 transition-all duration-200 " +
                      (overdue
                        ? "border-rose-400 dark:border-rose-900 ring-2 ring-rose-500/20"
                        : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700")
                    }
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                        {item?.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item?.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
                            Gear
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-base truncate">
                              {item?.title || "Item"}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                              {tab === "received"
                                ? `Borrower: ${borrower?.name || "Student"}`
                                : `Owner: ${owner?.name || "Student"}`}
                            </div>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
                          <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              Start Date
                            </div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                              {formatDate(b.startDate)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                              End Date
                            </div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                              {formatDate(b.endDate)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Total Rental:
                          </div>
                          <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {item?.listingType === "Exchange" || item?.price === 0
                              ? "Free Exchange"
                              : (
                                <div className="flex items-center gap-1.5">
                                  <span>₹{b.totalCost ?? 0}</span>
                                  {b.penaltyAmount > 0 && (
                                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded-md">
                                      + ₹{b.penaltyAmount} late
                                    </span>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>

                        {overdue && (
                          <div className="mt-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-xl p-2.5 text-xs font-semibold">
                            ⚠ Overdue: Return required urgently.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                      {tab === "received" && (
                        <>
                          {b.status === "pending" && (
                            <>
                              <button
                                type="button"
                                disabled={actionPending}
                                onClick={() => handleApprove(b)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-colors cursor-pointer"
                              >
                                Approve Request
                              </button>
                              <button
                                type="button"
                                disabled={actionPending}
                                onClick={() => handleReject(b)}
                                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 font-bold text-xs rounded-xl px-4 py-2 border border-rose-200 dark:border-rose-900/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl px-4 py-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Confirm Item Returned
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
                              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl px-4 py-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                              Leave a Review
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-2xl">
            <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Submit Review
                </h3>
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                >
                  ✕ Close
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

